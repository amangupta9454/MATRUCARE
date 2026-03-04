const Message = require('../models/Message');
const User = require('../models/User');
const { translateMessage } = require('../utils/translator');

// ── GET CONVERSATION HISTORY ──────────────────────────────────────────────────
exports.getMessages = async (req, res) => {
    try {
        const currentUserId = req.user._id;
        const otherUserId = req.params.userId;

        const messages = await Message.find({
            $or: [
                { sender: currentUserId, receiver: otherUserId },
                { sender: otherUserId, receiver: currentUserId }
            ]
        })
            .sort('createdAt')
            .populate('sender', 'name profileImage')
            .populate('receiver', 'name profileImage');

        // Mark incoming messages as read
        await Message.updateMany(
            { sender: otherUserId, receiver: currentUserId, isRead: false },
            { $set: { isRead: true } }
        );

        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// ── SEND MESSAGE WITH AUTO-TRANSLATION ────────────────────────────────────────
exports.sendMessage = async (req, res) => {
    try {
        const { receiverId, text } = req.body;
        const senderId = req.user._id;

        const receiver = await User.findById(receiverId);
        if (!receiver) return res.status(404).json({ message: 'Receiver not found' });

        // Translate the message. 
        // We auto-translate into the receiver's preferredLanguage if it is set.
        // Otherwise, we translate into a default set of primary languages to have them ready.
        let targetLangs = ['hi', 'mr'];
        if (receiver.preferredLanguage) {
            targetLangs = [receiver.preferredLanguage];
        }

        const translatedTextMap = await translateMessage(text, targetLangs);

        const msg = await Message.create({
            sender: senderId,
            receiver: receiverId,
            originalText: text,
            translatedText: translatedTextMap
        });

        await msg.populate('sender', 'name profileImage');
        await msg.populate('receiver', 'name profileImage');

        // Emit via Socket.io for Real-Time delivery
        const io = req.app.get('io');
        if (io) {
            // Emit to the receiver's private room/socket if tracking users, 
            // OR emit globally and let clients filter (simpler for this prototype)
            io.emit('receive_message', msg);
        }

        res.status(201).json(msg);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error sending message' });
    }
};

// ── GET CHAT CONTACTS ─────────────────────────────────────────────────────────
exports.getContacts = async (req, res) => {
    try {
        // Fetch all distinct users the current user has chatted with
        const messages = await Message.find({
            $or: [{ sender: req.user._id }, { receiver: req.user._id }]
        }).sort('-createdAt');

        const contactSet = new Map();

        for (const msg of messages) {
            const isSender = msg.sender.toString() === req.user._id.toString();
            const contactId = isSender ? msg.receiver.toString() : msg.sender.toString();

            if (!contactSet.has(contactId)) {
                contactSet.set(contactId, {
                    lastMessage: msg,
                    unreadCount: (!isSender && !msg.isRead) ? 1 : 0
                });
            } else if (!isSender && !msg.isRead) {
                contactSet.get(contactId).unreadCount += 1;
            }
        }

        // Hydrate contact details
        const contacts = [];
        for (const [id, data] of contactSet.entries()) {
            const user = await User.findById(id).select('name profileImage role');
            if (user) {
                contacts.push({ user, ...data });
            }
        }

        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching contacts' });
    }
};
