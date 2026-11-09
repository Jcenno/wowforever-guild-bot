# Pinned posts (posted 8 Nov 2026)

One pin per channel. Member-facing wording only. No tool names, no setup talk.

## #general · How this works

Posted as the welcome card via /post-welcome (text lives in worker/src/strings.js, `welcome`). The old /authorize pin was deleted. Draft kept for reference:

```
**How this Discord works**

**Dings** post here when someone hits a big milestone. The quiet stuff (level-ups, new recipes, rep) goes to #roster as a digest.

**Need something crafted?** Type `/need` and pick the item. The people who can make it get a ping, one of them presses *I'll make it*, and the card closes when it's done.

**Have something you don't need?** Type `/give` and pick the item. Need or Greed on the card. It closes after 3 hours (the giver can pick 1 hour to 1 day); the bot names the winner under the card, and the winner presses *Received* when it arrives.

**Who plays what, who crafts what:** #roster. `/professions <name>` shows anyone's recipes, `/who-crafts <item>` finds a crafter.

**One-time setup:** `/iam` and pick your main (add an alt if you have one). Your name takes your class color and the bot knows what you can Need on.
**Tank, Healer, DPS:** press what you play. More than one is fine for main and off-spec.

Only `@Dings` gets pinged. Turn it on in Channels & Roles if you want the big-milestone pings.
```

## #roster · topic
Who plays what and who crafts what. Updates itself about every 15 minutes.

## #announcements · topic
Official Blizzard posts about Forever: hotfixes, maintenance, news. Nothing else.

## #bot-commands · topic
Commands go here. /iam once to link your main, /need for crafts, /give for spare gear. Type / to see them all.

## #bot-commands · pin (posted)

```
Commands work in any channel; this one keeps #general clean.

`/need <item>` ask for a craft · `/give <item>` offer an item · `/iam <main> [alt]` link your characters
`/workshop` what is open · `/stock` spare mats · `/professions <character>` · `/who-crafts <item>` · `/help`
```
