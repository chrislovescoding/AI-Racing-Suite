class DebugMenu extends Menu {
  constructor(buttons) {
    super(buttons);

    this.firstTime = true;

    this.commentatePlay = false;

    this.debugLog = [];

    this.debugScrollDiv = createDiv();
    let sd = this.debugScrollDiv;

    sd.style("width", width * 0.613 + "px");
    sd.style("height", height * 0.465 + "px");

    sd.style("border", "none");
    sd.style("overflow-y", "scroll");
    sd.style("overflow-x", "hidden");
    sd.style("white-space", "normal");
    sd.style("word-wrap", "break-word");
    sd.style("position", "absolute");
    sd.style("top", height * 0.34 + "px");
    sd.style("left", height * 0.12 + "px");

    let styleElement = document.createElement("style");
    document.head.appendChild(styleElement);
    styleElement.sheet.insertRule(
      `
    ::-webkit-scrollbar {
      width: 12px;
    }
  `,
      0
    );
    styleElement.sheet.insertRule(
      `
    ::-webkit-scrollbar-track {
      background: transparent;
    }
  `,
      0
    );
    styleElement.sheet.insertRule(
      `
    ::-webkit-scrollbar-thumb {
      background-color:` +
        BACKGROUNDCOLOUR +
        `;
      border-radius: 6px;
    }
  `,
      0
    );

    require('dotenv').config();
    this.openAIKey = process.env.OPENAI_API_KEY;
    this.openAIEndpoint = "https://api.openai.com/v1/chat/completions";

    this.raceInfoWSUrl = "wss://www.myrcm.ch/myrcm/websocket";
    this.raceInfoWS = new WebSocket(this.raceInfoWSUrl);

    this.raceInfoWS.onopen = (event) => {
      this.addToLog(
        "Race Info WebSocket server connection established",
        "warning"
      );
    };

    this.raceInfoWS.onmessage = (event) => {
      let message = event.data;

      try {
        if (message !== undefined) {
          let formattedDataString = this.formatDataString(message);
          let formattedDataJSON = this.formatDataJSON(message);

          // this.addToLog(formattedDataString);
          this.handleIncomingMessage(formattedDataString);
          raceInformationMenu.raceInfoString = formattedDataString;
          raceInformationMenu.raceInfoJSON = formattedDataJSON;
        }
      } catch (err) {
        this.addToLog(err);
        print(err);
      }
    };

    this.raceInfoWS.onerror = (event) => {
      this.addToLog("Race Info WebSocket error observed:" + event, "error");
    };

    this.raceInfoWS.onclose = (event) => {
      this.addToLog(
        "Disconnected from the Race Info WebSocket server",
        "error"
      );
    };

    this.startedAudioPlaying = false;
    this.commentaryAudioQueue = new Queue();

    this.timeAtLastComment = millis();
    this.commentaryBufferTimeWindow = 17000;

    this.ttsApiKey = process.env.ELEVENLABS_API_KEY;
    this.voiceId = "Dnd9VXpAjEGXiRGBf1O6";
    this.modelID = "eleven_turbo_v2";
    this.elevenLabsTTSEndPointURL = `wss://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}/stream-input?model_id=${this.modelID}`;

    this.connectTTSWS();

    this.responses = "";
    this.raceDataStream = "";
    this.streamedMessage = "";
    this.recievedNewMessage = true;

    this.APIRequestsWSUrl = "ws://localhost:3000";
    this.APIRequestsWSServer = new WebSocket(this.APIRequestsWSUrl);

    this.APIRequestsWSServer.onopen = () => {
      this.addToLog(
        "API Requests WebSocket server connection established",
        "warning"
      );
    };

    this.APIRequestsWSServer.onmessage = (messageEvent) => {
      let data;
      let response;
      try {
        data = messageEvent.data;
        response = JSON.parse(data);
      } catch (error) {
        this.addToLog("Error parsing JSON: " + error, "error");
        return;
      }

      if (response.type === "GPT") {
        if (response.message !== "####") {
          this.streamedMessage += response.message;
          // print(response.message);
          this.elevenLabsWS.send(JSON.stringify({ text: response.message }));
        } else {
          this.responses += this.streamedMessage + "\n";

          this.recievedNewMessage = true;
          this.streamedMessage = "";
        }
      }
    };

    this.APIRequestsWSServer.onerror = (error) => {
      this.addToLog("API WebSocket error: " + error, "error");
    };

    this.clearDebugLogButton = new Button(
      width * 0.57,
      height * 0.281,
      width * 0.135,
      height / 20,
      "CLEAR",
      this.clearLog.bind(this),
      width * 0.035,
      0
    );

    this.subBackButton = new Button(
      width * 0.83,
      height * 0.263,
      width / 9.5,
      width / 9.5,
      "<",
      this.subBack.bind(this)
    );

    this.raceInformationButton = new Button(
      width * 0.78,
      height * 0.5,
      width * 0.125,
      width * 0.125,
      "i",
      this.toRaceInformation.bind(this)
    );

    let backButtonWidth = width / 8;

    this.debugBackButton = new Button(
      width - backButtonWidth * 1.1,
      backButtonWidth * 0.1,
      backButtonWidth,
      backButtonWidth,
      "<",
      this.debugBack.bind(this)
    );

    this.startCommentaryButton = new Button(
      width * 0.785,
      height * 0.71,
      width * 0.12,
      width * 0.12,
      "⏵",
      this.startCommentary.bind(this),
      width * 0.125,
      width * (5 / 400),
      width * 0.025
    );

    this.buttons.push(this.startCommentaryButton);
    this.buttons.push(this.clearDebugLogButton);
    this.buttons.push(this.subBackButton);
    this.buttons.push(this.raceInformationButton);
    this.buttons.push(this.debugBackButton);

    sd.hide();
  }

  logic() {
    if (this.firstTime) {
      this.firstTime = false;
    }

    push();
    textSize(width * (50 / 400) * 0.8);
    fill(TRACKCOLOUR);
    stroke(TRACKCOLOUR);
    text("COMMENTARY", width / 30, height / 9);
    pop();

    push();
    //draw rect outline
    rectMode(CENTER);
    stroke(TRACKCOLOUR);
    strokeWeight(width / 50);
    noFill();
    rect(width / 2, height / 1.8, width / 1.1, height / 1.6, width / 20);
    pop();

    push();
    stroke(TRACKCOLOUR);
    fill(TRACKCOLOUR);

    rectMode(CENTER);
    strokeWeight(width * 0.01);
    rect(
      width * 0.415,
      height * 0.555,
      width * 0.64,
      height * 0.55,
      width * 0.01
    );
    pop();

    push();
    textAlign(CENTER);
    textSize(width * 0.025);
    stroke(ERRORCOLOUR);
    fill(ERRORCOLOUR);
    text("Event Key: " + eventKeyMenu.eventKey, width * 0.2, height * 0.315);
    stroke(BACKGROUNDCOLOUR);
    fill(BACKGROUNDCOLOUR);
    textSize(width * 0.035);
    text("Debug Log", width * 0.43, height * 0.315);
    pop();

    push();
    rectMode(CENTER);
    fill(BACKGROUNDCOLOUR);
    stroke(BACKGROUNDCOLOUR);
    rect(
      width * 0.415,
      height * 0.575,
      width * 0.6,
      height * 0.475,
      width * 0.01
    );
    pop();

    this.showButtons();

    if (showError) {
      //display error message on screen
      const lifeSpan = 75;
      this.debugScrollDiv.hide();
      errorAliveTime = showErrorMessage(error, errorAliveTime, lifeSpan);
    }

    let doCommentary =
      this.recievedNewMessage &&
      this.commentatePlay &&
      raceInformationMenu.raceInfoJSON.eventName &&
      (millis() - this.timeAtLastComment > this.commentaryBufferTimeWindow ||
        this.firstCommentSinceStartCommentButtonPressed);

    if (doCommentary) {
      this.timeAtLastComment = millis();
      this.commentate();
      this.firstCommentSinceStartCommentButtonPressed = false;
    }
  }

  startCommentary() {
    this.commentatePlay = !this.commentatePlay;

    if (this.commentatePlay) {
      this.startCommentaryButton.label = "ll";
      this.firstCommentSinceStartCommentButtonPressed = true;
      if (this.commentaryAudioQueue.size() > 0) {
        this.playNextAudio();
      }
    } else {
      this.startCommentaryButton.label = "⏵";
    }
  }

  commentate() {
    let raceData = raceInformationMenu.raceInfoString;

    this.raceDataStream += raceData + "\n";

    if (this.responses == "") {
      this.makeGPTRequest(this.raceDataStream);
    } else {
      this.makeGPTRequest(this.raceDataStream + "\n" + this.responses);
    }

    this.recievedNewMessage = false;
  }

  makeGPTRequest(message) {
    this.APIRequestsWSServer.send(
      JSON.stringify({
        type: "GPT",
        prompt:
          message !== undefined && /[a-zA-Z]/.test(message)
            ? message
            : "No data",
      })
    );
  }

  makeTTSRequest(message) {
    this.APIRequestsWSServer.send({ type: "TTS", prompt: message.toString() });
  }

  clearLog() {
    this.debugScrollDiv.html("");
  }

  debugBack() {
    this.commentatePlay = false;
    this.startCommentaryButton.label = "⏵";

    this.debugScrollDiv.hide();
    menuStack.splice(menuStack.length - 2, 2);
  }

  subBack() {
    this.commentatePlay = false;
    this.startCommentaryButton.label = "⏵";

    this.debugScrollDiv.hide();
    menuStack.pop();
  }

  toRaceInformation() {
    this.debugScrollDiv.hide();
    menuStack.push(raceInformationMenu);
  }

  formatDataString(data) {
    let jsonData = JSON.parse(data);
    let event = jsonData.EVENT;
    let metaData = event.METADATA;

    let formattedData =
      "Name of event: " +
      metaData.NAME +
      "; raceLength: " +
      metaData.RACETIME +
      "; elapsedTime: " +
      metaData.CURRENTTIME +
      "; <br> racersData: ";

    for (let racer of event.DATA) {
      formattedData =
        formattedData +
        "{driverName: " +
        racer.PILOT +
        "; racePosition: " +
        racer.INDEX +
        "; carNumber: " +
        racer.VEHICLE +
        "; numberOfLapsCompleted: " +
        racer.LAPS +
        "; absoluteTime: " +
        racer.ABSOLUTTIME +
        "; bestLapTime: " +
        racer.BESTTIME +
        "; averageLapTime: " +
        racer.MEDIUMTIME +
        "}, <br>";
    }
    return formattedData;
  }

  formatDataJSON(data) {
    let jsonData = JSON.parse(data);
    let event = jsonData.EVENT;
    let metaData = event.METADATA;

    let formattedData = {
      eventName: metaData.NAME,
      raceLength: metaData.RACETIME,
      elapsedTime: metaData.CURRENTTIME,
      racersData: [],
    };

    for (let racer of event.DATA) {
      formattedData.racersData.push({
        driverName: racer.PILOT,
        racePosition: racer.INDEX,
        carNumber: racer.VEHICLE,
        numberOfLapsCompleted: racer.LAPS,
        absoluteTime: racer.ABSOLUTTIME,
        bestLapTime: racer.BESTTIME,
        averageLapTime: racer.MEDIUMTIME,
      });
    }

    return formattedData;
  }

  addToLog(message, type = "normal") {
    let messageSpan;
    let fontFamily = "Arial, sans-serif";
    let txtSize = str(width * 0.018) + "px";

    switch (type) {
      case "error":
        messageSpan = `<span style="color: red; font-family: ${fontFamily}; font-size: ${txtSize};">${message}</span><br>`;
        break;
      case "warning":
        messageSpan = `<span style="color: orange; font-family: ${fontFamily}; font-size: ${txtSize};">${message}</span><br>`;
        break;
      case "normal":
        messageSpan = `<span style="color: black; font-family: ${fontFamily}; font-size: ${txtSize};">${message}</span><br>`;
        break;
    }

    this.debugScrollDiv.html(messageSpan, true);
    this.debugScrollDiv.elt.scrollTop = this.debugScrollDiv.elt.scrollHeight;
  }

  handleIncomingMessage(message) {
    // this.addToLog("Processing message: "+ message);
  }

  startSession(eventKey) {
    this.sendWSMessage(
      '{"EventKey":"' + eventKey + '","Language":"-","Format":"JSON"}'
    );
  }

  sendWSMessage(message) {
    if (this.raceInfoWS.readyState === WebSocket.OPEN) {
      this.raceInfoWS.send(message);
    } else {
      this.addToLog("WebSocket is not open. Cannot send message", "warning");
    }
  }

  connectTTSWS() {
    this.elevenLabsWS = new WebSocket(this.elevenLabsTTSEndPointURL);

    this.elevenLabsWS.onopen = () => {
      this.addToLog(
        "Eleven Labs WebSocket server connection established",
        "warning"
      );

      this.elevenLabsWS.send(
        JSON.stringify({
          text: " ",
          voice_settings: { stability: 0.5, similarity_boost: 0.8 },
          xi_api_key: this.ttsApiKey,
        })
      );
    };

    this.elevenLabsWS.onmessage = (messageEvent) => {
      let message;
      try {
        message = JSON.parse(messageEvent.data);
      } catch (error) {
        this.addToLog("Error parsing JSON: " + error, "error");
        return;
      }

      if (message.error) {
        this.addToLog("Eleven Labs WS Error: " + message.error, "error");

        if (message.code === 1008) {
          this.addToLog("Attempting to reconnect to Eleven Labs WS", "warning");
          this.connectTTSWS();
        }
      } else if (message.audio) {
        this.enqueueBase64URL(message.audio);
      } else {
        print(message);
        this.addToLog(message.message, "normal");
      }
    };

    this.elevenLabsWS.onerror = (error) => {
      this.addToLog("Eleven Labs WebSocket error: " + error, "error");
    };
  }

  enqueueBase64URL(audio) {
    let audioString = audio.toString();

    let soundBlob = base64ToBlob(audioString, "audio/mp3");
    let soundURL = URL.createObjectURL(soundBlob);

    this.commentaryAudioQueue.enqueue(new Audio(soundURL));

    if (this.commentaryAudioQueue.size() === 1 && !this.startedAudioPlaying) {
      this.playNextAudio();
      this.startedAudioPlaying = true;
    }
  }

  playNextAudio() {
    if (this.commentaryAudioQueue.isEmpty() || !this.commentatePlay) {
      this.startedAudioPlaying = false;
      return;
    }

    let audio = this.commentaryAudioQueue.dequeue();

    audio.play();

    audio.onended = () => {
      this.playNextAudio();
    };
  }

  soundFinished() {
    this.commentaryAudioQueue.dequeue();
    this.playNextAudio();
  }

  showButtons() {
    this.buttons.forEach(function (button) {
      button.show();
    });
    this.debugScrollDiv.show();
    this.clearDebugLogButton.show();
    eventKeyMenu.eventKeyInputBox.hide();
  }
}
