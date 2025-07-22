"use client";

import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Circle, PhoneCall, PhoneOff, LoaderCircle } from "lucide-react";
import Vapi from "@vapi-ai/web";
import { toast } from "sonner";

type DoctorAgent = {
  id: number;
  name?: string;
  specialist: string;
  image?: string;
};

type SessionDetail = {
  id: number;
  notes: string;
  session_id: string;
  report: any;
  selectedDoctor: DoctorAgent;
  createdOn: string;
};

type Message = {
  role: string;
  text: string;
};

function MedicalVoiceAgent() {
  const { sessionId } = useParams();
  const [sessionDetail, setSessionDetail] = useState<SessionDetail | null>(null);
  const [callStarted, setCallStarted] = useState(false);
  const vapiRef = useRef<Vapi | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>();
  const [liveTranscript, setLiveTranscript] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!vapiRef.current && process.env.NEXT_PUBLIC_VAPI_API_KEY) {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_API_KEY);
    }
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      if (sessionId) {
        try {
          const result = await axios.get(`/api/users/session-chat?sessionId=${sessionId}`);
          setSessionDetail(result.data);
        } catch (error) {
          console.error("Error fetching session detail:", error);
        }
      }
    };
    fetchSession();
  }, [sessionId]);

  const getDoctorImage = () => {
    const doc = sessionDetail?.selectedDoctor;
    if (!doc) return "/doctor1.png";
    const img = doc.image?.trim();
    return img ? img : `/doctor${doc.id || 1}.png`;
  };

  const StartCall = async () => {
    const assistantId = process.env.NEXT_PUBLIC_VAPI_VOICE_ASSISTANT_ID;
    if (!vapiRef.current || !assistantId) {
      console.error("Vapi not initialized or assistant ID missing.");
      return;
    }

    try {
      await vapiRef.current.start(assistantId);

      vapiRef.current.on("call-start", () => setCallStarted(true));
      vapiRef.current.on("call-end", async () => {
        setCallStarted(false);
        try {
          setLoading(true);
          const result = await GenerateReport({
            sessionId: sessionId as string,
            sessionDetail,
            messages,
          });
          toast.success("Your report is generated!");
          router.replace("/dashboard");
        } catch (err) {
          console.error("Failed to generate report:", err);
        } finally {
          setLoading(false);
        }
      });

      vapiRef.current.on("message", (message: any) => {
        if (message.type === "transcript") {
          const { role, transcriptType, transcript } = message;
          if (transcriptType === "partial") {
            setLiveTranscript(transcript);
            setCurrentRole(role);
          } else if (transcriptType === "final") {
            setMessages((prev) => {
              const isDuplicate = prev.some(
                (msg) => msg.role === role && msg.text.trim() === transcript.trim()
              );
              if (!isDuplicate) {
                return [...prev, { role, text: transcript }];
              }
              return prev;
            });
            setLiveTranscript("");
            setCurrentRole(null);
          }
        }
      });

      vapiRef.current.on("speech-start", () => setCurrentRole("assistant"));
      vapiRef.current.on("speech-end", () => setCurrentRole("user"));
    } catch (err) {
      console.error("❌ Failed to start call:", err);
    }
  };

  return (
    <div className="p-10 border border-gray-300 rounded-2xl bg-gray-100">
      <div className="flex justify-between items-center">
        <h2 className="p-1 px-2 border rounded-md flex gap-2 items-center">
          <Circle className={`h-4 w-4 ${callStarted ? "bg-green-500" : "bg-red-500"}`} />
          {callStarted ? "Connected..." : "Not Connected"}
        </h2>
        <h2 className="font-bold text-xl text-gray-400">00:00</h2>
      </div>

      {sessionDetail?.selectedDoctor && (
        <div className="flex flex-col items-center gap-2 mt-6">
          <Image
            src={getDoctorImage()}
            alt={sessionDetail.selectedDoctor.specialist ?? "Doctor"}
            width={100}
            height={100}
            className="rounded-full object-cover"
          />
          <h2 className="text-lg font-semibold">{sessionDetail.selectedDoctor.specialist}</h2>
          <h1 className="text-xl text-gray-600 mt-2">AI Medical Voice Agent</h1>
        </div>
      )}

      <div className="mt-40 text-center">
        {messages.map((msg, index) => (
          <h2 className="text-gray-400" key={index}>
            {msg.role}: {msg.text}
          </h2>
        ))}
        {liveTranscript && (
          <h2 className="text-lg">
            {currentRole}: {liveTranscript}
          </h2>
        )}
      </div>

      <div className="flex justify-center mt-10">
        {!callStarted ? (
          <Button className="flex items-center gap-2" onClick={StartCall}>
            <PhoneCall />
            Start Call
          </Button>
        ) : (
          <Button variant="destructive" onClick={() => vapiRef.current?.stop()} disabled={loading}>
            {loading ? <LoaderCircle className="animate-spin h-5 w-5" /> : <PhoneOff />}
            Disconnect
          </Button>
        )}
      </div>
    </div>
  );
}

export default MedicalVoiceAgent;

// ✅ Report Generator
export const GenerateReport = async ({
  sessionId,
  sessionDetail,
  messages,
}: {
  sessionId: string;
  sessionDetail: any;
  messages: { role: string; text: string }[];
}) => {
  try {
    const response = await axios.post("/api/users/medical-report", {
      sessionId,
      sessionDetail,
      messages,
    });

    return response.data.report;
  } catch (error: any) {
    console.error("❌ Axios Error:", error.response?.data || error.message);
    alert("Medical report generation failed: " + (error.response?.data?.error || "Unknown error"));
    return null;
  }
};
