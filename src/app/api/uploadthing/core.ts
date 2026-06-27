import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { z } from 'zod'
import sharp from 'sharp'
import { db } from '@/db'

const f = createUploadthing()

export const ourFileRouter = {
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .input(z.object({ configId: z.string().optional() }))
    .middleware(async ({ input }) => {
      return { input }  // This becomes metadata
    })
    .onUploadComplete(async ({ metadata, file }) => {
      try {
        const { configId } = metadata.input as { configId?: string }

        // Use ufsUrl instead of url
        const imageUrl = file.ufsUrl

        // Fetch the image
        const res = await fetch(imageUrl)
        if (!res.ok) throw new Error('Failed to fetch image')

        const buffer = await res.arrayBuffer()

        const imgMetadata = await sharp(buffer).metadata()
        const { width, height } = imgMetadata

        if (!configId) {
          const configuration = await db.configuration.create({
            data: {
              imageUrl,
              height: height || 500,
              width: width || 500,
            },
          })

          return { configId: configuration.id }
        } else {
          const updatedConfiguration = await db.configuration.update({
            where: { id: configId },
            data: { croppedImageUrl: imageUrl },
          })

          return { configId: updatedConfiguration.id }
        }
      } catch (error) {
        console.error("❌ onUploadComplete error:", error)
        throw error // Important: let UploadThing know it failed
      }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter