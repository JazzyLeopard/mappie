'use server'

export async function sendMessage(formData: FormData) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/send`, {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()
    return data
  } catch (error) {
    return {
      success: false,
      message: 'Something went wrong. Please try again.',
    }
  }
}