const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const sendEmail = require('../config/nodemailer');
const generateAppointmentId = require('../utils/generateAppointmentId');

// @desc    Book an appointment (Mother)
// @route   POST /api/appointments
exports.bookAppointment = async (req, res) => {
  try {
    const {
      doctorId, date, time, notes,
      patientName, patientEmail, patientMobile,
      address, pregnancyMonth, previousHealthProblem, mode
    } = req.body;

    const doctor = await Doctor.findById(doctorId).populate('user', 'name email');
    if (!doctor || !doctor.isListed) {
      return res.status(400).json({ message: 'Doctor is not currently listed or accepting appointments.' });
    }

    // Prevent double booking for the same date/time
    // Assuming date is strict YYYY-MM-DD and time is strict e.g. '10:00 AM'
    const existingAppointment = await Appointment.findOne({ doctor: doctorId, date, time, status: { $ne: 'Cancelled' } });
    if (existingAppointment) {
      return res.status(400).json({ message: 'Time slot already booked by another patient.' });
    }

    let attachment = { url: '', public_id: '' };
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'maacare/appointments',
      });
      attachment = { url: result.secure_url, public_id: result.public_id };
    }

    const appointmentId = await generateAppointmentId();

    const appointment = await Appointment.create({
      appointmentId,
      mother: req.user._id,
      doctor: doctorId,
      date,
      time,
      notes,
      patientName,
      patientEmail,
      patientMobile,
      address,
      pregnancyMonth,
      previousHealthProblem,
      mode,
      attachment,
    });

    // Notify Mother
    await sendEmail({
      to: req.user.email,
      subject: 'MaaCare - Appointment Booked Successfully',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">Appointment Confirmation</h2>
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>Your appointment has been requested.</p>
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Appointment ID:</td><td style="padding:10px;">${appointmentId}</td></tr>
            <tr><td style="padding:10px; font-weight:bold;">Doctor:</td><td style="padding:10px;">Dr. ${doctor.user.name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Date:</td><td style="padding:10px;">${new Date(date).toLocaleDateString()}</td></tr>
            <tr><td style="padding:10px; font-weight:bold;">Time slot:</td><td style="padding:10px;">${time}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:10px; font-weight:bold;">Mode:</td><td style="padding:10px;">${mode || 'Consultation'}</td></tr>
          </table>
          <p style="margin-top:20px; color:#555; font-size: 13px;"><em>Note: You can cancel or reschedule up to 24 hours prior to the slot.</em></p>
          <p>Regards,<br/>MaaCare Team</p>
        </div>
      `,
    });

    // Notify Doctor
    await sendEmail({
      to: doctor.user.email,
      subject: 'MaaCare - New Appointment Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 600px;">
          <h2 style="color: #008080; border-bottom: 2px solid #008080; padding-bottom: 10px;">New Appointment (${appointmentId})</h2>
          <p>Dear Dr. <strong>${doctor.user.name}</strong>,</p>
          <p>A new appointment request has been made by <strong>${patientName}</strong>.</p>
          <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
          <p><strong>Time:</strong> ${time}</p>
          <p><strong>Reason:</strong> ${notes || 'N/A'}</p>
          <p>Please login to your dashboard to Approve or Reject this request.</p>
          <p>Regards,<br/>MaaCare Team</p>
        </div>
      `,
    });

    // Socket.io emit
    req.app.get('io').emit('newAppointment', { doctorId, appointment });

    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error booking appointment' });
  }
};

// @desc    Get user's appointments (Mother or Doctor)
// @route   GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    let appointments;

    if (req.user.role === 'Mother') {
      appointments = await Appointment.find({ mother: req.user._id })
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name email profileImage' } })
        .sort({ 'createdAt': -1 });
    } else if (req.user.role === 'Doctor') {
      const doctor = await Doctor.findOne({ user: req.user._id });
      appointments = await Appointment.find({ doctor: doctor._id })
        .populate('mother', 'name email profileImage')
        .sort({ 'createdAt': -1 });
    } else {
      // Admin sees all
      appointments = await Appointment.find({})
        .populate('mother', 'name email')
        .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } })
        .sort({ 'createdAt': -1 });
    }

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error fetching appointments' });
  }
};

// @desc    Update appointment status (Approve/Reject by Doctor)
// @route   PUT /api/appointments/:id/status
exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    let appointment = await Appointment.findById(req.params.id)
      .populate('mother', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    if (status === 'Rejected' || status === 'Cancelled') {
      if (!reason) {
        return res.status(400).json({ message: 'Reason is mandatory for rejection or cancellation.' });
      }
      appointment.cancellationReason = reason;
    }

    appointment.status = status;
    await appointment.save();

    // Notify Mother
    await sendEmail({
      to: appointment.patientEmail || appointment.mother.email,
      subject: `MaaCare - Appointment ${status}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #008080;">Appointment Status Update</h2>
          <p>Dear ${appointment.patientName},</p>
          <p>Your appointment <strong>${appointment.appointmentId}</strong> on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} with Dr. ${appointment.doctor.user.name} has been <strong>${status}</strong>.</p>
          ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
          <p>Regards,<br/>MaaCare Team</p>
        </div>
      `,
    });

    req.app.get('io').emit('appointmentUpdated', { appointment });

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error updating appointment status' });
  }
};

// @desc    Reschedule appointment (by Mother or Doctor)
// @route   PUT /api/appointments/:id/reschedule
exports.rescheduleAppointment = async (req, res) => {
  try {
    const { newDate, newTime } = req.body;
    let appointment = await Appointment.findById(req.params.id)
      .populate('mother', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 24 Hour check
    const appointmentDateTime = new Date(`${new Date(appointment.date).toISOString().split('T')[0]}T${appointment.time.split(' ')[0]}:00Z`); // Roughly checking, but simple logic:
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    // Exact Date object comparison (Assuming date stores the literal date):
    const aptDate = new Date(appointment.date);
    const diff = aptDate.getTime() - Date.now();
    if (req.user.role === 'Mother' && diff < ONE_DAY_MS) {
      return res.status(400).json({ message: 'You can only reschedule or cancel appointments at least 24 hours in advance.' });
    }

    // Add to history
    appointment.rescheduleHistory.push({
      oldDate: appointment.date,
      oldTime: appointment.time,
      newDate: newDate,
      newTime: newTime,
      rescheduledBy: req.user.role
    });

    appointment.date = newDate;
    appointment.time = newTime;
    appointment.status = 'Rescheduled'; // Optional to mark it Pending again or just keep Rescheduled. Let's keep it Rescheduled.
    await appointment.save();

    // Email to Doctor if mother rescheduled, else Email to Mother
    if (req.user.role === 'Mother') {
      await sendEmail({
        to: appointment.doctor.user.email,
        subject: `MaaCare - Appointment Rescheduled by Patient`,
        html: `<p>Patient ${appointment.patientName} rescheduled ${appointment.appointmentId} to ${new Date(newDate).toLocaleDateString()} at ${newTime}.</p>`
      });
    } else {
      await sendEmail({
        to: appointment.patientEmail,
        subject: `MaaCare - Appointment Rescheduled by Doctor`,
        html: `<p>Dr. ${appointment.doctor.user.name} rescheduled your appointment ${appointment.appointmentId} to ${new Date(newDate).toLocaleDateString()} at ${newTime}.</p>`
      });
    }

    req.app.get('io').emit('appointmentUpdated', { appointment });
    res.json({ message: 'Appointment Rescheduled', appointment });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error rescheduling appointment' });
  }
}

// @desc    Cancel appointment (by Mother)
// @route   DELETE /api/appointments/:id
exports.cancelAppointment = async (req, res) => {
  try {
    const { reason } = req.body;
    let appointment = await Appointment.findById(req.params.id)
      .populate('mother', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name email' } });

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // 24 Hour check
    const aptDate = new Date(appointment.date);
    const diff = aptDate.getTime() - Date.now();
    if (diff < (24 * 60 * 60 * 1000)) {
      return res.status(400).json({ message: 'Cancellations are only allowed at least 24 hours before the appointment date.' });
    }

    appointment.status = 'Cancelled';
    appointment.cancellationReason = reason || 'Cancelled by patient';
    await appointment.save();

    // Notify Doctor
    await sendEmail({
      to: appointment.doctor.user.email,
      subject: `MaaCare - Appointment Cancelled (${appointment.appointmentId})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #008080;">Appointment Cancelled</h2>
          <p>Dear Dr. ${appointment.doctor.user.name},</p>
          <p>The appointment scheduled on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time} by ${appointment.patientName} has been cancelled.</p>
          ${reason ? `<p>Reason: ${reason}</p>` : ''}
          <p>Regards,<br/>MaaCare Team</p>
        </div>
      `,
    });

    req.app.get('io').emit('appointmentUpdated', { appointment });

    res.json({ message: 'Appointment Cancelled', appointment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error cancelling appointment' });
  }
};

// ── Upload Prescription (Doctor only) ────────────────────────────────────────
// PUT /api/appointments/:id/prescription
// Body: multipart/form-data — file: prescriptionFile, notes: string (optional)
exports.uploadPrescription = async (req, res) => {
  const { Readable } = require('stream');
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('mother', 'name email')
      .populate({ path: 'doctor', populate: { path: 'user', select: 'name' } });

    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    // Verify the requesting doctor owns this appointment
    const Doctor = require('../models/Doctor');
    const doctorProfile = await Doctor.findOne({ user: req.user._id });
    if (!doctorProfile || appointment.doctor._id.toString() !== doctorProfile._id.toString()) {
      return res.status(403).json({ message: 'Not authorised to upload prescription for this appointment' });
    }

    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    // Delete old prescription from Cloudinary if exists
    if (appointment.prescription?.publicId) {
      await cloudinary.uploader.destroy(appointment.prescription.publicId, { resource_type: 'raw' }).catch(() => { });
    }

    // Upload to Cloudinary
    let uploadResult;
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'maacare/prescriptions', resource_type: 'auto', use_filename: true },
        (error, result) => { if (error) return reject(error); uploadResult = result; resolve(); }
      );
      Readable.from(req.file.buffer).pipe(stream);
    });

    appointment.prescription = {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      notes: req.body.notes || '',
      uploadedAt: new Date(),
    };
    await appointment.save();

    // Notify patient by email
    await sendEmail({
      to: appointment.mother.email,
      subject: `MaaCare — Prescription uploaded for Appointment ${appointment.appointmentId}`,
      html: `<div style="font-family:Arial,sans-serif;padding:20px;border-left:4px solid #008080;">
        <h2 style="color:#008080;">📋 Prescription Ready</h2>
        <p>Dear <strong>${appointment.mother.name}</strong>,</p>
        <p>Dr. <strong>${appointment.doctor?.user?.name}</strong> has uploaded a prescription for your appointment <strong>${appointment.appointmentId}</strong>.</p>
        ${req.body.notes ? `<p><strong>Doctor's Note:</strong> ${req.body.notes}</p>` : ''}
        <p>Log in to <strong>MaaCare</strong> → Mother Dashboard to view and download your prescription.</p>
        <p style="color:#718096;font-size:12px;">Appointment Date: ${new Date(appointment.date).toLocaleDateString('en-IN')}</p>
      </div>`,
    });

    res.json({ message: 'Prescription uploaded successfully', prescription: appointment.prescription });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading prescription' });
  }
};
