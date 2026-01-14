import { zodResolver } from "@hookform/resolvers/zod"
import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Textarea } from "@/components/ui/textarea"

const newSourceSchema = z.object({
  source: z.string().min(1, "Source is required"),
  text: z.string(),
  url: z.string().min(1, "URL is required").url("Invalid URL format"),
  speaker: z.string().min(1, "Speaker is required"),
})

type NewSourceFormValues = z.infer<typeof newSourceSchema>

export const Route = createFileRoute("/")({
  component: NewSourcePage,
})

function NewSourcePage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<NewSourceFormValues>({
    resolver: zodResolver(newSourceSchema),
    defaultValues: {
      source: "",
      text: "",
      url: "",
      speaker: "",
    },
  })

  const onSubmit = async (data: NewSourceFormValues) => {
    try {
      setIsSubmitting(true)
      const loadingToast = toast.loading("Processing source...", {
        description: "Extracting Q&A pairs from the source",
      })
      const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3001"

      const response = await fetch(`${baseUrl}/new-source`, {
        method: "POST",
        headers: {
          Accept: "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: data.source,
          text: data.text || "",
          url: data.url,
          speaker: data.speaker,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
      }

      const result = (await response.json()) as { question: string; answer: string }[]

      toast.dismiss(loadingToast)
      toast.success("Source processed successfully!", {
        description: `Extracted ${result.length} Q&A pairs`,
      })

      form.reset()
    } catch (error) {
      console.error("Submission error:", error)

      if (error instanceof TypeError && error.message.includes("fetch")) {
        toast.error("Network Error", {
          description: "Cannot connect to the API. Ensure the server is running on localhost:3001",
        })
      } else {
        toast.error("Failed to process source", {
          description: error instanceof Error ? error.message : "An unknown error occurred",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Add New Source</CardTitle>
            <CardDescription>Submit a new source for Q&A extraction</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Source</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., https://facebook.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Content (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Paste transcript or text content here..."
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., https://www.facebook.com/post/123"
                          type="url"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="speaker"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Speaker</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          </CardContent>
          <CardFooter>
            <Button
              type="button"
              onClick={form.handleSubmit(onSubmit)}
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? (
                <>
                  <Spinner className="mr-2" />
                  Processing...
                </>
              ) : (
                "Submit Source"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
