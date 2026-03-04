import React from 'react';

const HealthPassportQR = ({ qrValue }) => {
    // Dynamically loading the script for QR code generation to avoid adding extra dependencies if possible,
    // Alternatively you can assume 'react-qr-code' is installed as we'll run `npm install react-qr-code` later.
    const QRCode = require('react-qr-code').default || require('react-qr-code');

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg border-4 border-sky-100/50 inline-block">
            <QRCode
                value={qrValue || 'https://maacare.live/passport/default'}
                size={200}
                bgColor="#ffffff"
                fgColor="#000000"
                level="Q"
            />
        </div>
    );
};

export default HealthPassportQR;
