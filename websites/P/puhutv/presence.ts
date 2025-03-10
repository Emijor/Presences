const presence = new Presence({
    clientId: "628341182581440531"
  }),
  strings = presence.getStrings({
    play: "presence.playback.playing",
    pause: "presence.playback.paused"
  });

presence.on("UpdateData", async () => {
  const category = document.querySelector(
    "#widget_serie_contents_3 > section > div > div > div.category-main-content-right > header > h1 > strong"
  ) as HTMLElement;

  if (
    document.location.pathname === "/" ||
    !document.location.pathname ||
    (category && category.textContent !== "")
  ) {
    presence.setActivity({
      largeImageKey: "puhu-logo",
      startTimestamp: Math.floor(Date.now() / 1000),
      details: "Geziniyor...",
      state:
        category && category.textContent ? category.textContent : "Ana Sayfa"
    });
  } else {
    const video = document.querySelector(
      "#dyg_player_dogusPlayer_html5_api"
    ) as HTMLVideoElement;

    if (!video) return;
    else {
      const title = document.querySelector(
          "#widget_video_detail_3 > section.hero.hero--video-detay.hero--subpages > header > div > div.video-detay-header-content > h1 > a"
        ),
        episode =
          title &&
          document.querySelector(
            "#widget_video_detail_3 > section.hero.hero--video-detay.hero--subpages > header > div > div.video-detay-header-content > h1"
          )
            ? document
                .querySelector(
                  "#widget_video_detail_3 > section.hero.hero--video-detay.hero--subpages > header > div > div.video-detay-header-content > h1"
                )
                .textContent.replace(`${title.outerHTML} `, "")
            : null,
        timestamps = presence.getTimestamps(
          Math.floor(video.currentTime),
          Math.floor(video.duration)
        );

      if (!title || title.textContent === "") return;

      const presenceData: PresenceData = {
        largeImageKey: "puhu-logo",
        details: title.textContent,
        state:
          episode !== ""
            ? episode
            : `${
                document.querySelector(
                  "#widget_serie_detail_tab_5 > section > div > div > div > div.kunye-content-left > div:nth-child(3)"
                )
                  ? document
                      .querySelector<HTMLElement>(
                        "#widget_serie_detail_tab_5 > section > div > div > div > div.kunye-content-left > div:nth-child(3)"
                      )
                      .textContent.replace("\n", ": ")
                  : null
              }`,
        smallImageKey: video.paused ? "paused" : "playing",
        smallImageText: video.paused
          ? (await strings).pause
          : (await strings).play
      };

      if (!isNaN(timestamps[0]) && !isNaN(timestamps[1]))
        [presenceData.startTimestamp, presenceData.endTimestamp] = timestamps;

      if (video.paused) {
        delete presenceData.startTimestamp;
        delete presenceData.endTimestamp;
      }

      presence.setActivity(presenceData);
    }
  }
});
