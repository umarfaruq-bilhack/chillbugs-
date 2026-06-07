import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8)

export function generateReferralCode(): string {
  return `BUG-${nanoid()}`
}

export function shortWallet(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatPoints(points: number): string {
  return points.toLocaleString()
}
