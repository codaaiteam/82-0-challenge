可以，下面这版可以直接丢给 CC 开发。目标是 先做一个能抢 82-0 challenge 热点的 SEO + 轻量小游戏站，不要一开始做太重。

⸻

需求：82-0 Challenge SEO + Team Builder 小游戏站

项目目标

做一个独立小站：

82-0-challenge.com

核心目标：

1. 承接 Google 搜索词：
    * 82-0
    * 82-0 challenge
    * 82-0 challenge game
    * 82-0 game
    * 82-0 team builder
    * how to play 82-0 challenge
2. 首页既是 SEO 解释页，也是可玩的轻量游戏页。
3. 不直接复刻 NBA 官方 IP，不使用 NBA logo、球队 logo、球员照片。
    可以用纯文字、通用篮球主题、虚构/泛化球员数据。
4. 页面底部引导到自有产品：

Want to build your own AI character squad?
Try AI Character Squad Builder.

后续跳转到 C2Story 或独立 story squad 页面。

⸻

一、技术栈建议

优先用现有技术栈，推荐：

Next.js + TypeScript + Tailwind

数据先用本地 JSON，不需要数据库。

目录建议：

/app
  /page.tsx
  /82-0/page.tsx
  /how-to-play/page.tsx
  /team-builder/page.tsx
/components
  Game.tsx
  PlayerCard.tsx
  ResultCard.tsx
  SEOContent.tsx
  ShareButtons.tsx
/data
  players.json
  teams.json
  eras.json
/lib
  scoring.ts
  random.ts
  seed.ts

MVP 可以全部静态生成。

⸻

二、页面结构

首页 /

主词：

82-0 challenge

Title：

82-0 Challenge: Play the Viral Team Builder Game

Description：

Play an 82-0 style team builder challenge. Pick players, build a perfect lineup, and see if your team can go undefeated.

H1：

82-0 Challenge

首屏内容：

Can you build a team that goes 82-0?
Pick one player from each random team and era. Build your lineup and see your final record.

CTA：

Start Challenge

⸻

/82-0

主词：

82-0

Title：

82-0: What Is the Viral 82-0 Challenge Game?

内容偏 SEO 解释：

* What does 82-0 mean?
* What is the 82-0 challenge?
* How does the game work?
* Why is it going viral?
* Can you play an 82-0 style team builder here?

页面中嵌入同一个小游戏组件。

⸻

/how-to-play

Title：

How to Play the 82-0 Challenge

内容：

* Step 1: Get a random team and era
* Step 2: Pick one player
* Step 3: Build a 5-player lineup
* Step 4: Get your simulated record
* Step 5: Share your result

⸻

/team-builder

Title：

82-0 Team Builder

更偏游戏页。
小游戏组件放最上面，SEO 内容放下面。

⸻

三、游戏规则

基础规则

用户需要组一个 5 人阵容，目标是拿到最接近：

82-0

的赛季战绩。

每轮系统随机给一个：

Team + Era

例如：

Chicago 1990s
Los Angeles 2000s
Golden State 2010s
Miami 2010s
Boston 1980s

用户只能从该组合下的候选球员里选 1 个。

一共 5 轮，选满 5 人后生成结果。

⸻

四、数据结构

players.json

先手动准备 80–150 个球员，不需要太全。

字段：

type Player = {
  id: string
  name: string
  team: string
  era: string
  position: "PG" | "SG" | "SF" | "PF" | "C"
  overall: number
  offense: number
  defense: number
  shooting: number
  playmaking: number
  rebounding: number
  starPower: number
}

示例：

{
  "id": "mj-1990s-chicago",
  "name": "Legendary Chicago Guard",
  "team": "Chicago",
  "era": "1990s",
  "position": "SG",
  "overall": 99,
  "offense": 99,
  "defense": 96,
  "shooting": 88,
  "playmaking": 85,
  "rebounding": 70,
  "starPower": 100
}

注意：
MVP 先不要用真实球员照片、NBA logo。
如果要用真实球员姓名，页面必须加 disclaimer，且不要使用官方素材。

更稳妥的版本是用泛化名字：

Legendary Chicago Guard
Golden State Sharpshooter
Los Angeles Big Man
Miami Wing Star
Boston Floor General

⸻

五、游戏流程

状态

type GameState = {
  round: number
  lineup: Player[]
  currentTeam: string
  currentEra: string
  candidates: Player[]
  rerollsLeft: number
  finished: boolean
  result?: GameResult
}

默认：

round = 1
lineup = []
rerollsLeft = 3

⸻

每轮逻辑

1. 随机一个 team
2. 随机一个 era
3. 从 players 中筛选：

players.filter(p => p.team === team && p.era === era)

4. 展示最多 3–5 个候选
5. 用户选一个加入 lineup
6. 进入下一轮
7. 选满 5 人后进入结果页

⸻

Reroll 机制

每局给 3 次 reroll。

按钮：

Reroll Team & Era

点击后重新随机当前轮的 Team + Era + Candidates。

如果候选为空，也自动 reroll，直到有候选。

⸻

六、评分算法

文件：

/lib/scoring.ts

先用简单算法，不需要真实模拟比赛。

基础分

const avgOverall = average(lineup.map(p => p.overall))
const avgOffense = average(lineup.map(p => p.offense))
const avgDefense = average(lineup.map(p => p.defense))
const avgShooting = average(lineup.map(p => p.shooting))
const avgPlaymaking = average(lineup.map(p => p.playmaking))
const avgRebounding = average(lineup.map(p => p.rebounding))
const avgStarPower = average(lineup.map(p => p.starPower))

阵容平衡分

检查位置：

const positions = lineup.map(p => p.position)

Bonus：

有 PG + C：+2
五个位置至少覆盖 4 个：+3
五个位置全部覆盖：+5
没有 C：-3
没有 PG：-3
同位置超过 3 个：-4

最终评分

score =
  avgOverall * 0.45
+ avgOffense * 0.15
+ avgDefense * 0.15
+ avgShooting * 0.1
+ avgPlaymaking * 0.07
+ avgRebounding * 0.05
+ avgStarPower * 0.03
+ balanceBonus

限制：

score = Math.max(40, Math.min(100, score))

转换成战绩

wins = Math.round((score / 100) * 82)
losses = 82 - wins

为了让结果更有戏剧性，可以加一点随机波动：

variance = randomInt(-2, 2)
wins = clamp(Math.round((score / 100) * 82) + variance, 0, 82)

如果 score >= 98，可以有机会 82-0：

if (score >= 98 && Math.random() > 0.35) wins = 82

⸻

七、结果页

选满 5 人后展示：

Your Record: 78-4
Team Rating: 94/100
Best Pick: Golden State Sharpshooter
Weakness: No true center

根据 wins 给称号：

if wins === 82: "Perfect Season"
else if wins >= 78: "Almost Undefeated"
else if wins >= 70: "Championship Favorite"
else if wins >= 60: "Contender"
else: "Playoff Team"

分享文案：

I went 78-4 in the 82-0 Challenge. Can you beat my team?

按钮：

Play Again
Copy Result
Share on X
Build Another Team

底部 CTA：

Want to build a fantasy or anime squad instead?
Try AI Character Squad Builder.

⸻

八、SEO 内容模块

首页游戏下面加一段 SEO 内容，至少 800–1200 words。

结构：

## What Is the 82-0 Challenge?
## How the 82-0 Challenge Works
## Why 82-0 Is So Hard
## 82-0 Challenge Rules
## Tips to Build a Better Team
## 82-0 Challenge Alternatives
## Build Your Own AI Character Squad

需要自然覆盖关键词：

82-0
82-0 challenge
82-0 challenge game
82-0 game
82-0 team builder
how to play 82-0
82-0 challenge rules
viral basketball team builder

⸻

九、UI 要求

风格：

暗色/运动感/卡片式

首页布局：

1. 顶部 nav：
    * 82-0 Challenge
    * How to Play
    * Team Builder
2. Hero
3. Game Card
4. SEO explanation
5. FAQ
6. Footer disclaimer

游戏卡片：

Round 2 of 5
Team: Golden State
Era: 2010s
Rerolls left: 2

候选卡：

Name
Position
Overall
Offense / Defense / Shooting
Select Button

⸻

十、FAQ

页面底部加 FAQ，并加 JSON-LD structured data。

FAQ 内容：

What is the 82-0 challenge?
How do you play the 82-0 challenge?
What does 82-0 mean?
Can a team really go 82-0?
Is this an official NBA game?
How is the final record calculated?

官方声明：

This is an independent fan-made style team builder game. It is not affiliated with, endorsed by, or sponsored by the NBA or any professional basketball league.

⸻

十一、避免风险

必须做：

1. 不使用 NBA logo
2. 不使用球队官方 logo
3. 不使用球员照片
4. 不要写 “official NBA”
5. Footer 加 disclaimer
6. 如果用真实球员名，页面只作为评论/信息/游戏引用，不售卖球员素材

更稳版本：

全部用泛化球员名 + 城市名 + 年代

例如：

Chicago 1990s Guard
Los Angeles 2000s Big Man
Golden State 2010s Shooter
Miami 2010s Wing

⸻

十二、开发优先级

V1，当天上线

必须有：

首页
小游戏
本地 JSON 数据
评分结果
SEO 内容
FAQ
免责声明
分享按钮

不用做：

登录
排行榜
数据库
真实图片
复杂模拟
用户存档

⸻

V2，再做

每日挑战 Daily Challenge
固定 seed 分享链接
排行榜
结果海报
更多球员数据
AI Character Squad Builder 导流页

⸻

十三、验收标准

1. 打开首页能直接玩。
2. 每局 5 轮。
3. 每轮随机 Team + Era。
4. 用户能选择候选球员。
5. 有 3 次 reroll。
6. 选满 5 人后生成战绩。
7. 结果能复制分享。
8. 页面 title/meta 正确。
9. 页面包含 SEO 内容和 FAQ。
10. Footer 有 disclaimer。
11. 移动端体验正常。
12. Lighthouse SEO 基本通过。

⸻

十四、推荐首批数据

先准备这些 team / era：

Chicago 1990s
Los Angeles 2000s
Golden State 2010s
Miami 2010s
Cleveland 2010s
San Antonio 2000s
Boston 1980s
Detroit 1980s
Houston 1990s
Dallas 2010s
Milwaukee 2020s
Denver 2020s
Phoenix 2000s
Oklahoma City 2010s
Philadelphia 1980s

每个组合准备 3–5 个泛化球员。
总量 60–80 个就够 MVP。

⸻

十五、后续和 C2Story 连接

首页底部加：

Build more than a basketball team.
Create an AI character squad, generate a story, and turn it into a picture book.

按钮：

Try AI Character Squad Builder

后续跳：

https://c2story.com/character-squad-builder

或者先跳 C2Story 首页：

https://c2story.com

⸻

我建议你给 CC 的一句话总结：

做一个 82-0-challenge.com 的轻量 SEO + 小游戏站。首页能玩 5 轮 team builder，随机 team+era，选 5 个泛化篮球球员，算出 82-0 风格战绩。重点是快速上线抢 82-0 / 82-0 challenge 搜索，不要用 NBA logo 和球员照片，底部导流到 C2Story 的 AI Character Squad Builder。

## More Free Sports Challenge Games

- [38-0 Game](https://38-0-game.com/) — Premier League XI builder challenge
- [82-0 Challenge](https://www.82-0-challenge.com/) — NBA team builder challenge
- [7-0 Game](https://7-0-game.com/) — World Cup XI builder challenge
- [17-0 Challenge](https://17-0-game.com/) — NFL team builder challenge
