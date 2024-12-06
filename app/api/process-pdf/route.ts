// // pages/api/upload.ts
// import type { NextApiRequest, NextApiResponse } from 'next'
// import formidable, { Fields, Files } from 'formidable'
// import fs from 'fs/promises'
// import pdf from 'pdf-parse'

// export const config = {
//   api: {
//     bodyParser: false,
//   },
// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method not allowed' })
//   }

//   const form = new formidable.IncomingForm({ 
//     keepExtensions: true 
//   })
  
//   try {
//     const [fields, files] = await form.parse(req) as Promise<[Fields, Files]>
//     const file = files.file?.[0]
    
//     if (!file) {
//       throw new Error('No file uploaded')
//     }

//     const buffer = await fs.readFile(file.filepath)
//     const data = await pdf(buffer)
    
//     return res.status(200).json({
//       text: data.text,
//       pages: data.numpages,
//       info: data.info
//     })
//   } catch (error) {
//     console.error('Error processing PDF:', error)
//     return res.status(500).json({ error: 'Failed to process PDF' })
//   }
// }