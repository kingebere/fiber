// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next"
import { isDomainAvailable } from "../../lib/resources"

//since res sends out either available or error, I made it optional
type Data = {
  available?: boolean
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).end() // Method not allowed
  }
  try {
    const { domain } = req.body
    const isAvailable = await isDomainAvailable(domain)
    res.status(200).json({ available: isAvailable })
  } catch (error) {
    console.error("Error:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
