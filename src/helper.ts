export const sendSlackMessage = async (message: string, webHookUrl: string) => {
  const webhookURL = webHookUrl;

  const payload = {
    text: message,
  };

  try {
    const response = await fetch(webhookURL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    console.log("response", response);
    if (response.ok) {
      console.log("Message sent to Slack!");
    } else {
      console.error("Error sending message", response.statusText);
    }
  } catch (error) {
    console.error("Error:", error);
  }
};
