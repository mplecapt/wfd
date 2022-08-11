import nodemailer from 'nodemailer'
import z from 'zod'

const sendEmailSchema = z.object({
	email: z.string().email(),
	url: z.string().url(),
	token: z.string()
})
type SendEmailInput = z.TypeOf<typeof sendEmailSchema>

export async function sendLoginEmail({email, url, token}: SendEmailInput) {
	const testAccount = await nodemailer.createTestAccount()

	const transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass,
		}
	})

	const info = await transporter.sendMail({
		from: '"Jane Doe" <j.doe@example.com>',
		to: email,
		subject: 'Login to your account',
		html: `Login by clicking <a href="${url}/login#token=${token}">here</a>`
	})

	console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`)
}