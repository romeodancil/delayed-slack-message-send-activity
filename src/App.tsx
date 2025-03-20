import { useEffect, useState } from "react";
import { AlertComponent } from "./Alert";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";

type IntervalType = string | number | NodeJS.Timeout | undefined;
type UnitType = "minutes" | "seconds" | "hours";

function App() {
  const [delay, setDelay] = useState(0);
  const [unit, setUnit] = useState<UnitType>("seconds");
  const [buttonText, setButtonText] = useState("Send");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState("");
  const [isError, setIsError] = useState(false);
  const [disableSend, setDisableSend] = useState(false);

  const handleUnitValueChange = (value: UnitType) => {
    setUnit(value);
  };

  useEffect(() => {
    if (unit && delay > 0) {
      if (unit === "minutes") {
        setButtonText(`Send in ${formatInMinutes(delay)} ${unit}`);
      } else if (unit === "hours") {
        setButtonText(`Send in ${formatInHours(delay)} ${unit}`);
      } else {
        setButtonText(`Send in ${delay} ${unit}`);
      }
    } else {
      setButtonText("Send");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit, delay]);

  useEffect(() => {
    let interval: IntervalType;
    if (isSending && delay > 0) {
      interval = setInterval(() => {
        setDelay((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSending, unit, delay]);

  const formatTime = (value: string) => String(value).padStart(2, "0");

  const formatInMinutes = (secs: number) => {
    const minutes = Math.floor(secs / 60);
    const remainingSeconds = secs % 60;
    return `${formatTime(minutes.toString())}:${formatTime(
      remainingSeconds.toString()
    )}`;
  };

  const formatInHours = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const minutes = Math.floor((secs % 3600) / 60);
    const remainingSeconds = secs % 60;

    return `${formatTime(hours.toString())}:${formatTime(
      minutes.toString()
    )}:${formatTime(remainingSeconds.toString())}`;
  };

  const handleOnDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    const delayValue =
      unit === "seconds"
        ? value
        : unit === "minutes"
        ? value * 60
        : value * 3600;
    setDelay(delayValue);
  };

  useEffect(() => {
    if (delay === 0 && message && url) {
      sendSlackMessage(`From Romeo Dancil Slack Bot: ${message}`, url);
      setDisableSend(false);
    }
  }, [delay, message, url]);

  useEffect(() => {
    if (!isSending) {
      if (!delay || !message || !url) setDisableSend(true);
      else setDisableSend(false);
    }
    if (isSending) {
      setDisableSend(true);
    }
  }, [delay, message, url, isSending]);

  const sendSlackMessage = async (message: string, webHookUrl: string) => {
    const payload = {
      text: message,
      webhook: webHookUrl,
    };

    try {
      const response = await fetch("/api/send-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (data.success) {
        setStatus("Message sent to Slack!");
        setDisableSend(false);
        setIsError(false);
        setMessage("");
        setUrl("");
      } else {
        setDisableSend(false);
        setIsError(true);
        setStatus(data.error);
      }
    } catch (error) {
      setDisableSend(false);
      setIsError(true);
      setStatus("Error sending slack message check your configuration");
      console.error("Error:", error);
    }

    // try {
    //   const response = await fetch(webHookUrl, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify(payload),
    //   });
    //   console.log("response", response);
    //   if (response.ok) {
    //     setStatus("Message sent to Slack!");
    //     setDisableSend(false);
    //     setIsError(false);
    //   } else {
    //     setDisableSend(false);
    //     setIsError(true);
    //     setStatus(response.statusText);
    //   }
    // } catch (error: unknown) {
    //   setDisableSend(false);
    //   setIsError(true);
    //   setStatus("Error sending slack message check your configuration");
    //   console.error("Error:", error);
    // }
  };

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen">
      <div className="flex flex-col">
        <div className="flex items-center space-x-8">
          <Label htmlFor="unit">Select a unit:</Label>
          <Select onValueChange={handleUnitValueChange} name="unit">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a unit" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="seconds">Seconds</SelectItem>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-8">
          <Label className="whitespace-nowrap shrink-0" htmlFor="delay">
            Delay input:
          </Label>
          <Input name="delay" onChange={handleOnDelayChange} />
        </div>
        <div className="flex items-center space-x-8">
          <Label className="whitespace-nowrap shrink-0" htmlFor="message">
            Slack Message Input:
          </Label>
          <Input
            name="message"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setMessage(e.target.value)
            }
          />
        </div>
        <div className="flex items-center space-x-2">
          <Label className="whitespace-nowrap shrink-0" htmlFor="url">
            Slack Hook URL Input:
          </Label>
          <Input
            name="url"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUrl(e.target.value)
            }
          />
        </div>
        {status && (
          <div className="flex items-center space-x-8">
            <AlertComponent
              variant={isError ? "destructive" : "default"}
              message={status}
            />
          </div>
        )}
        <div className="flex items-center space-x-8">
          <Button
            disabled={disableSend}
            onClick={() => {
              setIsSending(true);
            }}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default App;
