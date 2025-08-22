"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import { useRouter } from "next/navigation";
import { AIDoctorAgents } from "../../../../shared/list";

function AddNewSessionDialog() {
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[] | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
  const router = useRouter();

  // -------------------------------
  // Start Consultation
  // -------------------------------
  const OnClickStart = async () => {
    console.log("🚀 Start button clicked");
    console.log("📝 Current note:", note);
    console.log("📋 Current suggestions:", suggestions);
    console.log("✅ Selected doctorId:", selectedDoctorId);

    if (!selectedDoctorId || !suggestions) {
      console.warn("⚠️ Cannot start consultation: No doctor selected or no suggestions");
      return;
    }

    const selectedDoctor = suggestions.find((doc) => doc.id === selectedDoctorId);
    console.log("👩‍⚕️ Selected doctor object:", selectedDoctor);

    if (!selectedDoctor) {
      setError("Selected doctor not found.");
      console.error("❌ ERROR: Selected doctor not found.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("📡 Sending request to /api/users/session-chat...");
      const result = await axios.post("/api/users/session-chat", {
        notes: note,
        selectedDoctor,
        allSuggestions: suggestions,
      });

      console.log("✅ API response:", result.data);

      const sessionId = result.data?.session_id || result.data?.[0]?.session_id;
      console.log("🆔 Extracted sessionId:", sessionId);

      if (sessionId) {
        console.log(`➡️ Redirecting to /dashboard/medical-agent/${sessionId}`);
        router.push(`/dashboard/medical-agent/${sessionId}`);

        // Reset state
        setNote("");
        setSuggestions(null);
        setSelectedDoctorId(null);
      } else {
        console.warn("⚠️ No sessionId found in API response");
      }
    } catch (err) {
      console.error("❌ API error in /api/users/session-chat:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
      console.log("🔄 Finished Start consultation flow");
    }
  };

  // -------------------------------
  // Suggest Doctors
  // -------------------------------
  const OnSuggestDoctors = async () => {
    console.log("🔍 Suggest button clicked");
    console.log("📝 Current note:", note);

    setLoading(true);
    setError(null);
    setSuggestions(null);
    setSelectedDoctorId(null);

    try {
      console.log("📡 Sending request to /api/users/suggest-doctors...");
      const result = await axios.post("/api/users/suggest-doctors", { notes: note });

      console.log("✅ Suggest-doctors API response:", result.data);

      const raw = result.data?.rawResp;
      console.log("🧠 Raw AI response:", raw);

      let extracted;
      try {
        const start = raw.indexOf("{");
        let open = 0;
        let end = -1;

        for (let i = start; i < raw.length; i++) {
          if (raw[i] === "{") open++;
          else if (raw[i] === "}") open--;
          if (open === 0) {
            end = i;
            break;
          }
        }

        const jsonStr = raw.slice(start, end + 1);
        console.log("📜 Extracted JSON string:", jsonStr);

        extracted = JSON.parse(jsonStr);
        console.log("✅ Parsed JSON:", extracted);

        if (!extracted?.suggested_doctors) {
          throw new Error("No doctors found in parsed response");
        }

        // Enrich with full doctor data
        const enrichedDoctors = extracted.suggested_doctors.map((doc: any) => {
          const match = AIDoctorAgents.find((d) => d.id === doc.id);
          return {
            ...doc,
            name: match?.specialist || doc.specialist,
            image: match?.image || "/default-doctor.png",
            description: match?.description || `${doc.specialist} (ID: ${doc.id})`,
            voiceId: match?.voiceId,
            agentPrompt: match?.agentPrompt,
            subscriptionRequired: match?.subscriptionRequired ?? false,
          };
        });

        console.log("🎯 Final Enriched Doctors:", enrichedDoctors);

        setSuggestions(enrichedDoctors);
      } catch (err) {
        console.error("❌ Failed to parse AI JSON:", err);
        setError("Invalid response from AI. Try again.");
      }
    } catch (err) {
      console.error("❌ API error in /api/users/suggest-doctors:", err);
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
      console.log("🔄 Finished Suggest Doctors flow");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="mt-3">+ Start Consultation</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Basic Details</DialogTitle>
          <DialogDescription>
            Please provide symptoms or additional details for consultation.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">
            Add Symptoms or Any Other Details
          </h2>
          <Textarea
  placeholder="Add detail here..."
  className="w-full min-h-[120px]"
  value={note}
  onChange={(e) => setNote(e.target.value)}
/>

            
        </div>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        {suggestions && (
          <div className="mt-4 bg-gray-100 p-3 rounded">
            <h3 className="font-semibold mb-2">Suggested Doctors:</h3>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {suggestions.map((doc) => (
                <li
                  key={doc.id}
                  className={`flex items-start gap-4 p-3 rounded shadow border transition ${
                    selectedDoctorId === doc.id
                      ? "border-blue-500 bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <img
                    src={doc.image || "/default-doctor.png"}
                    alt={doc.specialist}
                    className="w-12 h-12 rounded-full object-cover border"
                  />

                  <div className="flex-1">
                    <p className="font-bold text-sm">{doc.specialist}</p>
                    <div className="text-sm text-muted-foreground mb-1">
                      {doc.description}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={selectedDoctorId === doc.id ? "default" : "outline"}
                    onClick={() => {
                      console.log("👆 Doctor selected:", doc);
                      setSelectedDoctorId(doc.id);
                    }}
                  >
                    {selectedDoctorId === doc.id ? "Selected" : "Select"}
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button className="bg-white text-black border border-black hover:bg-neutral-100">
              Cancel
            </Button>
          </DialogClose>

          {!suggestions ? (
            <Button disabled={!note || loading} onClick={OnSuggestDoctors}>
              {loading ? "Loading..." : "Suggest"}
            </Button>
          ) : (
            <Button
              disabled={!selectedDoctorId || loading}
              onClick={OnClickStart}
            >
              {loading ? "Starting..." : "Start"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AddNewSessionDialog;
