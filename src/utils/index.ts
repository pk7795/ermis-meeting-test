import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)
dayjs.extend(timezone)

export const formatDate = (date: any) => (date ? dayjs(date).format('DD/MM/YYYY HH:mm:ss') : '')

export const genPasscode = () => {
  const length = 8
  const date = Date.now().toString()

  let charset = ''
  charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  charset += 'abcdefghijklmnopqrstuvwxyz'
  charset += date

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}

export const formatDateChat = (date: Date) => (date ? dayjs(date).format('hh:mm a') : '')

export const formatName = (str: string) => {
  if (!str) return ''

  if (str.length > 20) {
    return str.slice(0, 4) + "..." + str.slice(-5)
  }
  return str
}

export const generateRandomString = (length: number) => {
  const date = Date.now().toString()

  let charset = ''
  charset += '1234567890'
  charset += 'abcdefghijklmnopqrstuvwxyz'
  charset += date

  let password = ''
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length))
  }
  return password
}
