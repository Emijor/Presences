const presence = new Presence({
    clientId: "735588731637203080"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused",
    browse: "presence.activity.browsing"
  }),
  getElement = (query: string): string | undefined => {
    return document.querySelector(query)?.textContent;
  };

let elapsed = Math.floor(Date.now() / 1000),
  prevUrl = document.location.href;

const statics = {
  "/": {
    details: "Browsing...",
    state: "Home"
  },
  "/myshazam/": {
    details: "Viewing Page...",
    state: "My Shazam"
  },
  "/apps/": {
    details: "Viewing Page...",
    state: "Mobile App"
  },
  "/company/": {
    details: "Viewing Page...",
    state: "About Shazam"
  },
  "/terms/": {
    details: "Viewing Page...",
    state: "Terms of Service"
  },
  "/privacy/": {
    details: "Viewing Page...",
    state: "Privacy Policy"
  }
};

presence.on("UpdateData", async () => {
  const path = location.pathname.replace(/\/?$/, "/"),
    showSong = await presence.getSetting<boolean>("song"),
    showTimestamps = await presence.getSetting<boolean>("timestamp"),
    song: HTMLVideoElement = document.querySelector("#audioctrl"),
    songPlaying = song ? !song.paused : false;

  let presenceData: PresenceData = {
    largeImageKey: "shazam",
    startTimestamp: elapsed
  };

  if (document.location.href !== prevUrl) {
    prevUrl = document.location.href;
    elapsed = Math.floor(Date.now() / 1000);
  }

  for (const [k, v] of Object.entries(statics))
    if (path.match(k)) presenceData = { ...presenceData, ...v };

  if (showSong && songPlaying) {
    presenceData.details = getElement(".track .heading");
    presenceData.state = getElement(".track .subheading");
    presenceData.smallImageKey = "play";
    presenceData.smallImageText = (await strings).play;

    const [startTimestamp, endTimestamp] = presence.getTimestamps(
      song.currentTime,
      song.duration
    );
    presenceData.startTimestamp = startTimestamp;
    presenceData.endTimestamp = endTimestamp;
  }

  if (!songPlaying) {
    if (path.includes("/charts/")) {
      presenceData.details = "Viewing Charts...";
      presenceData.state = getElement(
        ".quicklinks-content > li:not(.show-link)"
      );
    }

    if (path.includes("/track/")) {
      presenceData.details = "Viewing Track...";
      presenceData.state = `${getElement(".details h1")} by ${getElement(
        ".details h2"
      )}`;
    }

    if (path.includes("/artist/")) {
      presenceData.details = "Viewing Artist...";
      presenceData.state = getElement(".details h1");
    }
  }

  if (presenceData.details) {
    if (presenceData.details.match("(Browsing|Viewing)")) {
      presenceData.smallImageKey = "reading";
      presenceData.smallImageText = (await strings).browse;
    }
    if (!showTimestamps) {
      delete presenceData.startTimestamp;
      delete presenceData.endTimestamp;
    }

    presence.setActivity(presenceData);
  } else presence.setActivity();
});
