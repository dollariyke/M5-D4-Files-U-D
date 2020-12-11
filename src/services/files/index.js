const express = require("express")
const multer = require("multer")
const { writeFile, createReadStream } = require("fs-extra")
const { pipeline } = require("stream")
const zlib = require("zlib")/* this is used for zipping the file to be sent*/
const { join } = require("path")

const router = express.Router()

const upload = multer({})

const studentsFolderPath = join(__dirname, "../../../public/img/students")

// upload one file
router.post("/upload", upload.single("avatar"), async (req, res, next) => {
  try {
    // write the file on the disc
    await writeFile(
      join(studentsFolderPath, req.file.originalname),
      req.file.buffer
    )
    res.send("ok")
  } catch (error) {
    console.log(error)
    next(error)
  }
})

// upload multiple file
router.post(
  "/uploadMultiple",
  upload.array("multipleAvatar", 2),// the number limits the file to process
  async (req, res, next) => {
    try {
      // write the multiple file on the disc
      const arrayOfPromises = req.files.map(file =>
        writeFile(join(studentsFolderPath, file.originalname), file.buffer)
      )
      await Promise.all(arrayOfPromises)
      res.send("ok")
    } catch (error) {
      console.log(error)
      next(error)
    }
  }
)

router.get("/:name/download", (req, res, next) => {
  // start reading stream from the path on the disc. path concatenated with the request name
  const source = createReadStream(
    join(studentsFolderPath, `${req.params.name}`)
  )
  res.setHeader(
    "Content-Disposition",
    `attachment; filename=${req.params.name}.gz`
    // this ask the browser to prompt out the save on disc window
  )
  pipeline(source, zlib.createGzip() ,res, error => next(error))
})

module.exports = router
