"use client";

import * as z from "zod";
import Heading from "@/components/heading";
import { MessageSquare } from "lucide-react";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { formSchema } from "./constants";

type ChatCompletionMessage = {
  role: "user" | "assistant";
  content: string;
};

const ConversationPage = () => {
  const router = useRouter();
  const [messages, setMessages] = React.useState<ChatCompletionMessage[]>([]);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const userMessage: ChatCompletionMessage = {
        role: "user",
        content: values.prompt,
      };
      const newMessage = [...messages, userMessage];

      const response = await axios.post("/api/conversation", {
        messages: newMessage,
      });

      const assistantMessage: ChatCompletionMessage = response.data;

      setMessages((prevMessages) => [...prevMessages, userMessage, assistantMessage]);
      form.reset();
    } catch (error: any) {
      console.log(error);
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Conversation"
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
            >
              <FormField
                name="prompt"
                render={({ field }) => (
                  <FormItem className="col-span-12 lg:col-span-10">
                    <FormControl className="m-0 p-0">
                      <Input
                        className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                        disabled={isLoading}
                        placeholder="What is Next.js?"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                className="col-span-12 lg:col-span-2 w-full"
                disabled={isLoading}
              >
                Generate
              </Button>
            </form>
          </Form>
        </div>
        <div className="space-y-4 mt-4">
          {messages.map((message, index) => (
            <div key={index} className="border p-2 rounded">
              <p className={message.role === "user" ? "text-blue-600" : "text-green-600"}>
                {message.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;
