'use server'

export async function sendLineNotification(text: string) {
  const token = process.env.LINE_ACCESS_TOKEN
  const userId = process.env.LINE_USER_ID

  if (!token || !userId) {
    console.error('LINE keys are missing')
    return
  }

  try {
    await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [
          {
            type: 'text',
            text: text,
          },
        ],
      }),
    })
  } catch (error) {
    console.error('LINE Send Error:', error)
  }
}