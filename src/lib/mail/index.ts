import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendVerifyMail = async (userMail: string, verifyURL: string) => {
  const msg = {
    to: userMail,
    from: process.env.SENDGRID_MAIL!,
    subject: "Welcome to What a Movie!",
    html: `<div style="display:flex; flex-direction: column; align-items: center;">
                <div style="max-width: 175px">
                    <img style="width: 100%" src="https://res.cloudinary.com/yasirdev/image/upload/v1683015717/WhataMovie/dev/logo.png" alt="logo" />
                </div>
                <p>Please verify your account by clicking <a href="${verifyURL}" style="color: #C81E1D; font-weight:bolder">this link</a></p>
           </div>`,
  };
  try {
    await sgMail.send(msg);
    console.log("Verify mail sent!");
  } catch (error) {
    console.log(error);
  }
};
