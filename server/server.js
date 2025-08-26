import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import revealRouter from './routes/revealImageRouter.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '5mb' }))

// File storage for demo (local ./uploads)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadDir = path.join(__dirname, 'uploads')
const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
})
const upload = multer({ storage })

app.post('/api/upload', upload.single('image'), (req, res) => {
  res.json({ ok: true, file: req.file?.filename })
})

app.use('/api/reveal', revealRouter)

const PORT = process.env.PORT || 8080
app.listen(PORT, () => {
  console.log('Server listening on', PORT)
})
