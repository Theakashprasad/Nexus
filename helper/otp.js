const nodemailer = require("nodemailer")

// +++++++++++++++++++++++++++++++++++++++++++++++++++         OTP               ++++++++++++++++++++++++++++++++++++++++++++++++++


const sendOTPByEmail = async (email, otp) => {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, //
      auth: {
        user: process.env.OTP_USERNAME,
        pass: process.env.OTP_PASS,
      },
    });
    
    const mailOptions = {
      from: "nexus@gmail.com", // me/admin
      to: email, // user email
      subject: 'OTP verification',//subject
      html: `<h2> OTP Verifictaion</h2>   
        <p>Your OTP for verification is:  </p>
         <h3> Your OTP is: ${otp}</h3>`, //passing otp with email
    };
  
    // Sending   email
    try {
      const info = await transporter.sendMail(mailOptions)
      console.log('Email sent:' + info.response)
    } catch (err) {

      console.log(err);
      res.json("Internal server error")
    }
  }
  

module.exports = sendOTPByEmail;