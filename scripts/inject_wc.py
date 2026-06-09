#!/usr/bin/env python3
"""Inject the World Cup (7-0) game UI strings + original SEO page copy into every locale."""
import json, os

LOC = os.path.join(os.path.dirname(__file__), '..', 'src', 'locales')

# ---- game UI strings (wcGame) per locale ----
WC = {}
SZ = {}  # pages.sevenZero per locale

WC['en'] = {
    "squad": "SQUAD", "format": "FORMAT", "formation": "FORMATION", "style": "STYLE", "mode": "DIFFICULTY",
    "sources": {"National": "National team", "All-Stars": "World All-Stars"},
    "formats": {"Single": "Single match", "Gauntlet": "Gauntlet"},
    "styles": {"Defensive": "Defensive", "Balanced": "Balanced", "Attacking": "Attacking"},
    "modes": {"Classic": "Classic", "From memory": "From memory"},
    "rollHint": "Roll to draw a national team and a World Cup edition — modern squads and legendary winners.",
    "rollHintAllStars": "Roll a world All-Stars pool, then build the greatest cross-nation XI ever — chemistry rewards stacking countrymen together.",
    "gauntletHint": "Gauntlet: one dream team must win four knockout rounds to lift the trophy.",
    "roll": "ROLL", "drawn": "DRAWN", "allStarsDraw": "WORLD ALL-STARS", "crossNation": "Cross-nation legends",
    "cup": "World Cup", "rerollLabel": "Re-roll", "left": "left",
    "anotherTeam": "Another team", "anotherCup": "Another cup", "anotherPool": "New pool",
    "autoFill": "Auto-fill best", "clear": "Clear", "chemistry": "CHEMISTRY",
    "pickPlayer": "PICK A PLAYER", "boxScore": "LINE-UP",
    "rules": "A perfect dream team wins 7–0. Out-of-position players (~) lose rating. Pick a tactical style and chase the flawless score.",
    "rulesAllStars": "All-Stars: any nation, any era. Stack countrymen next to each other for chemistry — a flawless, well-linked dream team wins 7–0.",
    "fillToSim": "Fill all 11 to play", "simulate": "Simulate match", "playRound": "Play", "advance": "Advance",
    "playAgain": "Play again", "attack": "ATTACK", "defense": "DEFENSE", "overall": "OVERALL",
    "perfects": "7-0s", "titles": "titles", "streak": "streak",
    "champion": "CHAMPIONS!", "eliminated": "Knocked out",
    "rounds": {"group": "Group", "round16": "Round of 16", "semi": "Semi-final", "final": "Final"},
    "verdict": {"perfect": "PERFECT 7–0! 🏆", "demolition": "Demolition 💥", "rout": "Statement win",
                "win": "You win ✅", "draw": "Honours even", "loss": "Knocked out"},
}

SZ['en'] = {
    "title": "7-0 Game: World Cup All-Time Dream Team Builder",
    "description": "Build the greatest World Cup XI ever. Mix legends from 1970 to 2026, stack countrymen for chemistry, run the knockout gauntlet, and chase a perfect 7–0. Free, no sign-up.",
    "h1": "7-0 Game — All-Time World Cup Dream Team",
    "intro": "This is the deepest 7-0 builder we make: pull a single nation or an open World All-Stars pool, drop real players from eight decades into your formation, link countrymen for chemistry, then either chase a single flawless 7–0 or survive a four-round knockout gauntlet to lift the trophy.",
    "playCta": "Play the original 7-0 Game →",
    "sections": [
        {"h2": "World All-Stars: the cross-nation dream team",
         "paragraphs": [
             "Most 7-0 games lock you to one country. This one adds a World All-Stars mode that throws open the doors: a single pool can hand you Pelé, Maradona, Cruyff and Zidane to line up in the same eleven. You are no longer building Brazil's best or France's best — you are building football's best, full stop.",
             "But raw ratings are not enough. Chemistry rewards placing countrymen next to each other on the pitch, so the perfect All-Stars side is a balancing act between star power and national links. A team of eleven loners from eleven nations will look terrifying on paper and misfire on grass."]},
        {"h2": "The knockout gauntlet",
         "paragraphs": [
             "Single-match mode is the classic chase for one perfect 7–0. The gauntlet is the long road: your dream team must win four straight knockout rounds — group, round of 16, semi-final and final — against opponents that get stronger every step. Lose once and you are out; win all four and you are champions.",
             "Because you keep the same squad through the bracket, the gauntlet rewards a deep, well-built eleven over a flat-track bully. You can tweak your line-up between rounds, so reading the next opponent and shifting your tactical style becomes part of the game."]},
        {"h2": "Legends from every era",
         "paragraphs": [
             "Alongside the modern 2018, 2022 and 2026 squads, we added hand-picked legendary editions: Brazil 1970 and 2002, Argentina 1986, the Netherlands of 1974, West Germany 1990, France 1998, Italy 1982, England 1966, Spain 2010 and Uruguay 1950. Draw one of these and you are building with the players who actually defined the World Cup.",
             "It means a single roll can send you eight decades back or drop you into a projected 2026 side — and in All-Stars mode, all of those eras share one player pool."]},
    ],
    "faqs": [
        {"q": "How is this different from the standalone 7-0 Game?",
         "a": "This in-site edition adds four things the standalone does not have: a cross-nation World All-Stars mode, a four-round knockout gauntlet, a chemistry system that rewards linking countrymen, and hand-built legendary squads from 1950 to 2010."},
        {"q": "What is a perfect 7–0?",
         "a": "7–0 is the flawless scoreline. To earn it you need a high-rated eleven, every player in a position they truly fit, strong chemistry in All-Stars mode, and a tactical style that suits your squad."},
        {"q": "How does chemistry work?",
         "a": "In World All-Stars mode, each player links with their on-pitch neighbours. Neighbours from the same nation raise chemistry; isolated players lower it. Higher chemistry boosts your attack and defence, so clustering countrymen matters as much as raw ratings."},
        {"q": "What is the gauntlet?",
         "a": "A knockout run of four rounds with rising difficulty. The same dream team must win all four — group, round of 16, semi-final and final — to be crowned champions. You can adjust your line-up between rounds."},
        {"q": "Are the players and ratings real?",
         "a": "Player names are real, era-appropriate footballers and ratings are believable approximations for entertainment. This is an independent fan project, not affiliated with FIFA, any federation or club."},
        {"q": "Is it free and multilingual?",
         "a": "Yes. It is completely free, needs no account, runs in your browser, and is available in English, 中文, 日本語, 한국어, Español, Français and Deutsch. Your stats are saved locally on your device."},
    ],
}

# ---------------- 中文 ----------------
WC['zh'] = {
    "squad": "阵容来源", "format": "赛制", "formation": "阵型", "style": "战术", "mode": "难度",
    "sources": {"National": "国家队", "All-Stars": "世界全明星"},
    "formats": {"Single": "单场", "Gauntlet": "闯关夺冠"},
    "styles": {"Defensive": "防守", "Balanced": "均衡", "Attacking": "进攻"},
    "modes": {"Classic": "经典", "From memory": "凭记忆"},
    "rollHint": "抽一支国家队和一届世界杯——现代阵容与传奇冠军都有。",
    "rollHintAllStars": "抽一个世界全明星球员池，组建史上最强跨国 XI——同国球员相邻可提升默契。",
    "gauntletHint": "闯关：同一套梦之队连赢4个淘汰赛回合才能夺冠。",
    "roll": "抽签", "drawn": "抽到", "allStarsDraw": "世界全明星", "crossNation": "跨国传奇",
    "cup": "世界杯", "rerollLabel": "重抽", "left": "次",
    "anotherTeam": "换队", "anotherCup": "换届", "anotherPool": "换球员池",
    "autoFill": "一键最优", "clear": "清空", "chemistry": "默契",
    "pickPlayer": "选择球员", "boxScore": "阵容",
    "rules": "完美梦之队能赢 7–0。不对位的球员(~)会扣分。选好战术，追逐完美比分。",
    "rulesAllStars": "全明星：任意国家、任意年代。把同国球员摆在相邻位置提升默契——阵容完美且默契高才能赢 7–0。",
    "fillToSim": "填满 11 人开赛", "simulate": "模拟比赛", "playRound": "开打", "advance": "晋级",
    "playAgain": "再来一局", "attack": "进攻", "defense": "防守", "overall": "综合",
    "perfects": "次 7-0", "titles": "冠军", "streak": "连胜",
    "champion": "夺冠！", "eliminated": "被淘汰",
    "rounds": {"group": "小组赛", "round16": "16 强", "semi": "半决赛", "final": "决赛"},
    "verdict": {"perfect": "完美 7–0！🏆", "demolition": "血洗 💥", "rout": "大胜",
                "win": "你赢了 ✅", "draw": "打平", "loss": "被淘汰"},
}
SZ['zh'] = {
    "title": "7-0 游戏：世界杯历史最佳梦之队组队器",
    "description": "组建史上最强世界杯 XI。混搭 1970 到 2026 的传奇球星，同国球员凑默契，跑闯关淘汰赛，追逐完美 7–0。免费，免注册。",
    "h1": "7-0 游戏 — 世界杯历史最佳梦之队",
    "intro": "这是我们最深度的 7-0 组队器：抽单一国家队，或开放的世界全明星球员池，把八个年代的真实球员放进你的阵型，用同国球员凑默契，然后要么追逐单场完美 7–0，要么打过四轮淘汰赛夺冠。",
    "playCta": "体验独立版 7-0 游戏 →",
    "sections": [
        {"h2": "世界全明星：跨国梦之队",
         "paragraphs": [
             "大多数 7-0 游戏把你锁在一个国家。这个版本加了世界全明星模式：一个球员池里可能同时出现贝利、马拉多纳、克鲁伊夫和齐达内。你不再是在组巴西最强或法国最强，而是在组足球史上最强。",
             "但光有高分不够。默契系统奖励你把同国球员摆在相邻位置，所以完美的全明星阵容是明星成色与国籍默契之间的权衡。十个国家的十一名独行侠，纸面吓人，草皮上却会哑火。"]},
        {"h2": "闯关夺冠",
         "paragraphs": [
             "单场模式是经典的单场追逐完美 7–0。闯关是长路：你的梦之队要连赢四轮淘汰赛——小组赛、16 强、半决赛和决赛——对手逐轮变强。输一场就出局，四轮全胜才夺冠。",
             "因为整个淘汰赛用同一套阵容，闯关奖励深度、均衡的阵容。你可以在回合之间调整阵容，所以读懂下一个对手、切换战术也成了玩法的一部分。"]},
        {"h2": "每个年代的传奇",
         "paragraphs": [
             "除了 2018、2022、2026 的现代阵容，我们还精选了传奇届数：巴西 1970 与 2002、阿根廷 1986、荷兰 1974、西德 1990、法国 1998、意大利 1982、英格兰 1966、西班牙 2010 和乌拉圭 1950。抽到这些，你就在用真正定义了世界杯的球员组队。",
             "一次抽签可能把你送回八个年代前，也可能落在 2026 的预测阵容——而在全明星模式里，所有这些年代共享一个球员池。"]},
    ],
    "faqs": [
        {"q": "这和独立版 7-0 游戏有什么不同？",
         "a": "站内版多了四个独立版没有的东西：跨国世界全明星模式、四轮闯关夺冠、奖励同国球员连线的默契系统，以及 1950 到 2010 的手制传奇阵容。"},
        {"q": "什么是完美 7–0？",
         "a": "7–0 是完美比分。要赢得它，你需要高评分的十一人、每个球员都在适合的位置、全明星模式下足够的默契，以及适合阵容的战术。"},
        {"q": "默契怎么算？",
         "a": "在世界全明星模式里，每名球员与球场上的邻居连线。同国邻居提升默契，孤立球员降低默契。默契越高，进攻和防守越强，所以把同国球员凑在一起和明星成色一样重要。"},
        {"q": "什么是闯关？",
         "a": "四轮递增难度的淘汰赛。同一套梦之队要连赢四轮——小组赛、16 强、半决赛、决赛——才能夺冠。回合之间可以调整阵容。"},
        {"q": "球员和评分是真的吗？",
         "a": "球员是真实的、符合年代的足球运动员，评分是用于娱乐的合理近似。这是独立粉丝项目，与 FIFA、任何足协或俱乐部无关。"},
        {"q": "免费且多语言吗？",
         "a": "是的。完全免费、无需账号、浏览器即玩，支持英、中、日、韩、西、法、德七种语言。成绩保存在你的设备本地。"},
    ],
}

# For the remaining locales, reuse the English game UI but translate the headline labels
# that users actually read. To keep this maintainable we translate ja/ko/es/fr/de fully below.
import copy

def base_wc():
    return copy.deepcopy(WC['en'])

# ---- ja ----
WC['ja'] = base_wc(); WC['ja'].update({
    "squad": "スカッド", "format": "形式", "formation": "フォーメーション", "style": "戦術", "mode": "難易度",
    "sources": {"National": "代表チーム", "All-Stars": "世界オールスター"},
    "formats": {"Single": "単発試合", "Gauntlet": "ガントレット"},
    "styles": {"Defensive": "守備", "Balanced": "バランス", "Attacking": "攻撃"},
    "modes": {"Classic": "クラシック", "From memory": "記憶だけ"},
    "roll": "抽選", "drawn": "抽選結果", "allStarsDraw": "世界オールスター", "crossNation": "国を越えた伝説",
    "cup": "ワールドカップ", "rerollLabel": "引き直し", "left": "回",
    "anotherTeam": "別のチーム", "anotherCup": "別の大会", "anotherPool": "新しいプール",
    "autoFill": "最適自動", "clear": "クリア", "chemistry": "連携",
    "pickPlayer": "選手を選ぶ", "boxScore": "ラインアップ",
    "fillToSim": "11人揃えて開始", "simulate": "試合をシミュレート", "playRound": "プレー", "advance": "進出",
    "playAgain": "もう一度", "attack": "攻撃", "defense": "守備", "overall": "総合",
    "perfects": "回 7-0", "titles": "優勝", "streak": "連勝",
    "champion": "優勝！", "eliminated": "敗退",
    "rounds": {"group": "グループ", "round16": "ベスト16", "semi": "準決勝", "final": "決勝"},
})
SZ['ja'] = {
    "title": "7-0 ゲーム：ワールドカップ史上最高のドリームチームビルダー",
    "description": "史上最強のワールドカップXIを作ろう。1970年から2026年までの伝説を混ぜ、同国の連携を積み、ガントレットを走り、完璨7–0を追う。無料・登録不要。",
    "h1": "7-0 ゲーム — 史上最高のワールドカップドリームチーム",
    "intro": "これは最も深い7-0ビルダーです。単一の代表チームか、世界オールスターの選手プールを引き、八つの時代の実在の選手をフォーメーションに配置し、同国の連携を結び、単発で完璨7–0を狙うか、四回戦のガントレットを勝ち抜いて優勝を目指します。",
    "playCta": "オリジナル7-0ゲームをプレイ →",
    "sections": [
        {"h2": "世界オールスター：国を越えたドリームチーム",
         "paragraphs": [
             "多くの7-0ゲームは1つの国に限定されます。この版は世界オールスターモードを追加し、ペレ、マラドーナ、クライフ、ジダンを同じXIに並べられます。",
             "しかしレーティングだけでは不十分です。連携は同国の選手を隣に置くことを報います。"]},
        {"h2": "ノックアウトガントレット",
         "paragraphs": [
             "単発モードは古典的な完璨7–0の追求。ガントレットは長い道のりで、ドリームチームが4回戦を連勝して優勝を目指します。",
             "同じスカッドでブラケットを進むため、ラウンド間でラインアップを調整できます。"]},
        {"h2": "あらゆる時代の伝説",
         "paragraphs": [
             "2018、2022、2026の現代スカッドに加え、ブラジル1970・2002、アルゼンチン1986などの伝説のスカッドを追加しました。",
             "1回の抽選で八つの時代を行き来できます。"]},
    ],
    "faqs": [
        {"q": "スタンドアロン版7-0と何が違う？", "a": "クロスネーションのオールスター、四回戦ガントレット、連携システム、伝説のスカッドの4つを追加しました。"},
        {"q": "完璨7–0とは？", "a": "7–0は完璨なスコアです。高評価のXI、適正ポジション、高い連携、適した戦術が必要です。"},
        {"q": "連携の仕組みは？", "a": "オールスターモードでは各選手が隣と連携し、同国なら高まります。"},
        {"q": "ガントレットとは？", "a": "難易度が上がる4回戦のノックアウト。同じチームで全勝すると優勝です。"},
        {"q": "選手と評価は本物？", "a": "選手は実在の選手で、評価は娯楽用の近似です。FIFA等とは無関係のファンプロジェクトです。"},
        {"q": "無料で多言語？", "a": "はい。完全無料、アカウント不要、7言語対応です。"},
    ],
}

# ---- ko ----
WC['ko'] = base_wc(); WC['ko'].update({
    "squad": "스쿼드", "format": "방식", "formation": "포메이션", "style": "전술", "mode": "난이도",
    "sources": {"National": "국가대표", "All-Stars": "월드 올스타"},
    "formats": {"Single": "단판승", "Gauntlet": "토너먼트"},
    "styles": {"Defensive": "수비", "Balanced": "균형", "Attacking": "공격"},
    "modes": {"Classic": "클래식", "From memory": "기억으로"},
    "roll": "추첨", "drawn": "추첨 결과", "allStarsDraw": "월드 올스타", "crossNation": "국경을 넘은 전설",
    "cup": "월드컵", "rerollLabel": "다시 추첨", "left": "회",
    "anotherTeam": "다른 팀", "anotherCup": "다른 대회", "anotherPool": "새 풀",
    "autoFill": "최적 자동", "clear": "비우기", "chemistry": "케미스트리",
    "pickPlayer": "선수 선택", "boxScore": "라인업",
    "fillToSim": "11명 채우기", "simulate": "경기 시뮬레이션", "playRound": "시작", "advance": "진출",
    "playAgain": "다시 하기", "attack": "공격", "defense": "수비", "overall": "종합",
    "perfects": "회 7-0", "titles": "우승", "streak": "연승",
    "champion": "우승!", "eliminated": "탈락",
    "rounds": {"group": "조별리그", "round16": "16강", "semi": "준결승", "final": "결승"},
})
SZ['ko'] = {
    "title": "7-0 게임: 월드컵 역대 최고 드림팀 빌더",
    "description": "역대 최강 월드컵 XI를 만드세요. 1970년부터 2026년까지의 전설을 섞고, 같은 국가 선수로 케미스트리를 쌓고, 토너먼트를 돌파하며 완벽한 7–0을 추구하세요. 무료, 가입 불필요.",
    "h1": "7-0 게임 — 월드컵 역대 최고 드림팀",
    "intro": "가장 깊은 7-0 빌더입니다. 단일 국가대표나 월드 올스타 풀을 뽑고, 여덟 시대의 실존 선수를 포메이션에 배치하고, 같은 국가 선수를 연결해 케미스트리를 만들고, 단판승 7–0 또는 4라운드 토너먼트 우승에 도전합니다.",
    "playCta": "오리지널 7-0 게임 플레이 →",
    "sections": [
        {"h2": "월드 올스타: 국경을 넘는 드림팀",
         "paragraphs": [
             "대부분의 7-0 게임은 한 국가로 제한됩니다. 이 버전은 월드 올스타 모드를 추가해 펠레, 마라도나, 크루이프, 지단을 같은 XI에 넣을 수 있습니다.",
             "하지만 능력치만으로는 부족합니다. 케미스트리는 같은 국가 선수를 옆에 두는 것을 보상합니다."]},
        {"h2": "토너먼트",
         "paragraphs": [
             "단판승은 완벽한 7–0을 쪼는 고전입니다. 토너먼트는 긴 여정으로, 드림팀이 4라운드를 연속 이겨야 우승합니다.",
             "같은 스쿼드로 대진표를 진행하므로 라운드 사이에 라인업을 조정할 수 있습니다."]},
        {"h2": "모든 시대의 전설",
         "paragraphs": [
             "2018, 2022, 2026 현대 스쿼드와 함께 브라질 1970·2002, 아르헨티나 1986 등 전설적 스쿼드를 추가했습니다.",
             "한 번의 추첨로 여덟 시대를 오갈 수 있습니다."]},
    ],
    "faqs": [
        {"q": "독립 버전 7-0과 뭐가 다른가요?", "a": "크로스네이션 올스타, 4라운드 토너먼트, 케미스트리 시스템, 전설 스쿼드 네 가지를 추가했습니다."},
        {"q": "완벽한 7–0이란?", "a": "7–0은 완벽한 스코어입니다. 고평가 XI, 적정 포지션, 높은 케미스트리, 알맞은 전술이 필요합니다."},
        {"q": "케미스트리는 어떻게 작동하나요?", "a": "올스타 모드에서 각 선수는 이웃과 연결되며 같은 국가일수록 높아집니다."},
        {"q": "토너먼트란?", "a": "난이도가 오르는 4라운드 토너먼트입니다. 같은 팀으로 모두 이기면 우승입니다."},
        {"q": "선수와 능력치는 실제인가요?", "a": "선수는 실존 선수이고 능력치는 오락용 근사값입니다. FIFA 등과 무관한 팬 프로젝트입니다."},
        {"q": "무료이고 다국어인가요?", "a": "네, 완전 무료, 계정 불필요, 7개 언어를 지원합니다."},
    ],
}

# ---- es ----
WC['es'] = base_wc(); WC['es'].update({
    "squad": "PLANTILLA", "format": "FORMATO", "formation": "FORMACIÓN", "style": "ESTILO", "mode": "DIFICULTAD",
    "sources": {"National": "Selección nacional", "All-Stars": "Estrellas mundiales"},
    "formats": {"Single": "Partido único", "Gauntlet": "Eliminatoria"},
    "styles": {"Defensive": "Defensivo", "Balanced": "Equilibrado", "Attacking": "Ofensivo"},
    "modes": {"Classic": "Clásico", "From memory": "De memoria"},
    "roll": "SORTEAR", "drawn": "SORTEADO", "allStarsDraw": "ESTRELLAS MUNDIALES", "crossNation": "Leyendas de todas las naciones",
    "cup": "Mundial", "rerollLabel": "Volver a sortear", "left": "rest.",
    "anotherTeam": "Otro equipo", "anotherCup": "Otro mundial", "anotherPool": "Nuevo grupo",
    "autoFill": "Autorrellenar", "clear": "Limpiar", "chemistry": "QUÍMICA",
    "pickPlayer": "ELIGE UN JUGADOR", "boxScore": "ALINEACIÓN",
    "fillToSim": "Completa los 11", "simulate": "Simular partido", "playRound": "Jugar", "advance": "Avanzar",
    "playAgain": "Jugar otra vez", "attack": "ATAQUE", "defense": "DEFENSA", "overall": "GLOBAL",
    "perfects": "7-0", "titles": "títulos", "streak": "racha",
    "champion": "¡CAMPEONES!", "eliminated": "Eliminado",
    "rounds": {"group": "Grupos", "round16": "Octavos", "semi": "Semifinal", "final": "Final"},
})
SZ['es'] = {
    "title": "Juego 7-0: Constructor del mejor once histórico del Mundial",
    "description": "Crea el mejor XI mundialista de la historia. Mezcla leyendas de 1970 a 2026, suma química juntando compatriotas, supera la eliminatoria y busca el 7–0 perfecto. Gratis, sin registro.",
    "h1": "Juego 7-0 — El mejor once histórico del Mundial",
    "intro": "Este es el constructor 7-0 más completo: saca una sola selección o un grupo abierto de Estrellas Mundiales, coloca jugadores reales de ocho décadas en tu formación, enlaza compatriotas para ganar química y luego persigue un 7–0 perfecto o sobrevive a una eliminatoria de cuatro rondas para levantar el trofeo.",
    "playCta": "Juega al 7-0 original →",
    "sections": [
        {"h2": "Estrellas Mundiales: el once de todas las naciones",
         "paragraphs": [
             "La mayoría de los juegos 7-0 te limitan a un país. Esta versión añade el modo Estrellas Mundiales: un solo grupo puede darte a Pelé, Maradona, Cruyff y Zidane en el mismo once.",
             "Pero la valoración no basta. La química premia colocar compatriotas juntos, así que el once perfecto equilibra estrellas y conexiones nacionales."]},
        {"h2": "La eliminatoria",
         "paragraphs": [
             "El partido único es la búsqueda clásica del 7–0 perfecto. La eliminatoria es el camino largo: tu equipo debe ganar cuatro rondas seguidas para ser campeón.",
             "Como mantienes la misma plantilla, puedes ajustar la alineación entre rondas según el rival."]},
        {"h2": "Leyendas de todas las épocas",
         "paragraphs": [
             "Junto a las plantillas modernas de 2018, 2022 y 2026, añadimos ediciones legendarias: Brasil 1970 y 2002, Argentina 1986 y más.",
             "Un solo sorteo puede llevarte ocho décadas atrás o a un equipo proyectado de 2026."]},
    ],
    "faqs": [
        {"q": "¿En qué se diferencia del 7-0 independiente?", "a": "Añade cuatro cosas: el modo Estrellas Mundiales, una eliminatoria de cuatro rondas, un sistema de química y plantillas legendarias de 1950 a 2010."},
        {"q": "¿Qué es un 7–0 perfecto?", "a": "7–0 es el marcador perfecto. Necesitas un once de alta valoración, cada jugador en su posición, buena química y un estilo adecuado."},
        {"q": "¿Cómo funciona la química?", "a": "En Estrellas Mundiales cada jugador se enlaza con sus vecinos; los compatriotas suben la química y los aislados la bajan."},
        {"q": "¿Qué es la eliminatoria?", "a": "Cuatro rondas de dificultad creciente. El mismo equipo debe ganarlas todas para ser campeón."},
        {"q": "¿Los jugadores y valoraciones son reales?", "a": "Los nombres son futbolistas reales y las valoraciones son aproximaciones para entretenimiento. Proyecto de aficionados sin relación con la FIFA."},
        {"q": "¿Es gratis y multilingüe?", "a": "Sí. Totalmente gratis, sin cuenta, en siete idiomas."},
    ],
}

# ---- fr ----
WC['fr'] = base_wc(); WC['fr'].update({
    "squad": "EFFECTIF", "format": "FORMAT", "formation": "FORMATION", "style": "STYLE", "mode": "DIFFICULTÉ",
    "sources": {"National": "Sélection nationale", "All-Stars": "Stars mondiales"},
    "formats": {"Single": "Match unique", "Gauntlet": "Phase finale"},
    "styles": {"Defensive": "Défensif", "Balanced": "Équilibré", "Attacking": "Offensif"},
    "modes": {"Classic": "Classique", "From memory": "De mémoire"},
    "roll": "TIRER", "drawn": "TIRAGE", "allStarsDraw": "STARS MONDIALES", "crossNation": "Légendes de toutes nations",
    "cup": "Coupe du monde", "rerollLabel": "Retirer", "left": "rest.",
    "anotherTeam": "Autre équipe", "anotherCup": "Autre coupe", "anotherPool": "Nouveau pool",
    "autoFill": "Remplir au mieux", "clear": "Effacer", "chemistry": "ALCHIMIE",
    "pickPlayer": "CHOISIR UN JOUEUR", "boxScore": "COMPOSITION",
    "fillToSim": "Complétez les 11", "simulate": "Simuler le match", "playRound": "Jouer", "advance": "Avancer",
    "playAgain": "Rejouer", "attack": "ATTAQUE", "defense": "DÉFENSE", "overall": "GLOBAL",
    "perfects": "7-0", "titles": "titres", "streak": "série",
    "champion": "CHAMPIONS !", "eliminated": "Éliminé",
    "rounds": {"group": "Groupes", "round16": "8es", "semi": "Demi-finale", "final": "Finale"},
})
SZ['fr'] = {
    "title": "Jeu 7-0 : créateur du meilleur onze de l'histoire de la Coupe du monde",
    "description": "Composez le meilleur XI mondial de l'histoire. Mélangez les légendes de 1970 à 2026, gagnez de l'alchimie en alignant des compatriotes, franchissez la phase finale et visez le 7–0 parfait. Gratuit, sans inscription.",
    "h1": "Jeu 7-0 — Le meilleur onze de l'histoire de la Coupe du monde",
    "intro": "Voici le créateur 7-0 le plus complet : tirez une seule sélection ou un pool ouvert de Stars mondiales, placez de vrais joueurs de huit décennies dans votre formation, reliez les compatriotes pour l'alchimie, puis visez un 7–0 parfait ou survivez à une phase finale de quatre tours pour soulever le trophée.",
    "playCta": "Jouer au 7-0 original →",
    "sections": [
        {"h2": "Stars mondiales : le onze de toutes les nations",
         "paragraphs": [
             "La plupart des jeux 7-0 vous enferment dans un pays. Cette version ajoute le mode Stars mondiales : un seul pool peut vous donner Pelé, Maradona, Cruyff et Zidane dans le même onze.",
             "Mais la note ne suffit pas. L'alchimie récompense le placement de compatriotes côte à côte ; le onze parfait équilibre stars et liens nationaux."]},
        {"h2": "La phase finale",
         "paragraphs": [
             "Le match unique est la quête classique du 7–0 parfait. La phase finale est la longue route : votre équipe doit gagner quatre tours d'affilée pour être championne.",
             "Comme vous gardez le même effectif, vous pouvez ajuster la composition entre les tours selon l'adversaire."]},
        {"h2": "Des légendes de toutes les époques",
         "paragraphs": [
             "Outre les effectifs modernes de 2018, 2022 et 2026, nous avons ajouté des éditions légendaires : Brésil 1970 et 2002, Argentine 1986 et plus.",
             "Un seul tirage peut vous renvoyer huit décennies en arrière ou vers une équipe projetée de 2026."]},
    ],
    "faqs": [
        {"q": "Quelle différence avec le 7-0 indépendant ?", "a": "Il ajoute quatre choses : le mode Stars mondiales, une phase finale à quatre tours, un système d'alchimie et des effectifs légendaires de 1950 à 2010."},
        {"q": "Qu'est-ce qu'un 7–0 parfait ?", "a": "7–0 est le score parfait. Il faut un onze très noté, chaque joueur à son poste, une bonne alchimie et un style adapté."},
        {"q": "Comment fonctionne l'alchimie ?", "a": "En mode Stars mondiales, chaque joueur se lie à ses voisins ; les compatriotes augmentent l'alchimie, les isolés la baissent."},
        {"q": "Qu'est-ce que la phase finale ?", "a": "Quatre tours de difficulté croissante. La même équipe doit tous les gagner pour être championne."},
        {"q": "Les joueurs et notes sont-ils réels ?", "a": "Les noms sont de vrais footballeurs et les notes des approximations pour le divertissement. Projet de fans sans lien avec la FIFA."},
        {"q": "Est-ce gratuit et multilingue ?", "a": "Oui. Totalement gratuit, sans compte, en sept langues."},
    ],
}

# ---- de ----
WC['de'] = base_wc(); WC['de'].update({
    "squad": "KADER", "format": "FORMAT", "formation": "FORMATION", "style": "STIL", "mode": "SCHWIERIGKEIT",
    "sources": {"National": "Nationalmannschaft", "All-Stars": "Welt-All-Stars"},
    "formats": {"Single": "Einzelspiel", "Gauntlet": "K.-o.-Lauf"},
    "styles": {"Defensive": "Defensiv", "Balanced": "Ausgewogen", "Attacking": "Offensiv"},
    "modes": {"Classic": "Klassisch", "From memory": "Aus dem Gedächtnis"},
    "roll": "LOSEN", "drawn": "GELOST", "allStarsDraw": "WELT-ALL-STARS", "crossNation": "Legenden aller Nationen",
    "cup": "WM", "rerollLabel": "Neu losen", "left": "übrig",
    "anotherTeam": "Andere Mannschaft", "anotherCup": "Andere WM", "anotherPool": "Neuer Pool",
    "autoFill": "Optimal füllen", "clear": "Leeren", "chemistry": "HARMONIE",
    "pickPlayer": "SPIELER WÄHLEN", "boxScore": "AUFSTELLUNG",
    "fillToSim": "Alle 11 befüllen", "simulate": "Spiel simulieren", "playRound": "Spielen", "advance": "Weiter",
    "playAgain": "Nochmal", "attack": "ANGRIFF", "defense": "ABWEHR", "overall": "GESAMT",
    "perfects": "7-0", "titles": "Titel", "streak": "Serie",
    "champion": "WELTMEISTER!", "eliminated": "Ausgeschieden",
    "rounds": {"group": "Gruppe", "round16": "Achtelfinale", "semi": "Halbfinale", "final": "Finale"},
})
SZ['de'] = {
    "title": "7-0 Spiel: Bauer der besten WM-Elf aller Zeiten",
    "description": "Baue die stärkste WM-Elf der Geschichte. Mische Legenden von 1970 bis 2026, sammle Harmonie durch Landsleute, überstehe den K.-o.-Lauf und jage das perfekte 7–0. Kostenlos, ohne Anmeldung.",
    "h1": "7-0 Spiel — Die beste WM-Elf aller Zeiten",
    "intro": "Dies ist der tiefste 7-0-Builder: Ziehe eine einzelne Nationalmannschaft oder einen offenen Welt-All-Stars-Pool, setze echte Spieler aus acht Jahrzehnten in deine Formation, verbinde Landsleute für Harmonie und jage dann ein perfektes 7–0 oder überstehe einen K.-o.-Lauf über vier Runden, um den Pokal zu holen.",
    "playCta": "Spiele das originale 7-0 →",
    "sections": [
        {"h2": "Welt-All-Stars: die Elf aller Nationen",
         "paragraphs": [
             "Die meisten 7-0-Spiele binden dich an ein Land. Diese Version fügt den Welt-All-Stars-Modus hinzu: Ein einziger Pool kann dir Pelé, Maradona, Cruyff und Zidane in derselben Elf geben.",
             "Doch Bewertungen allein genügen nicht. Harmonie belohnt das Nebeneinanderstellen von Landsleuten — die perfekte Elf balanciert Starpower und nationale Verbindungen."]},
        {"h2": "Der K.-o.-Lauf",
         "paragraphs": [
             "Das Einzelspiel ist die klassische Jagd nach dem perfekten 7–0. Der K.-o.-Lauf ist der lange Weg: Deine Elf muss vier Runden in Folge gewinnen, um Meister zu werden.",
             "Da du denselben Kader behältst, kannst du die Aufstellung zwischen den Runden je nach Gegner anpassen."]},
        {"h2": "Legenden aus jeder Epoche",
         "paragraphs": [
             "Neben den modernen Kadern von 2018, 2022 und 2026 haben wir legendäre Editionen ergänzt: Brasilien 1970 und 2002, Argentinien 1986 und mehr.",
             "Eine einzige Ziehung kann dich acht Jahrzehnte zurück oder in eine prognostizierte 2026er-Elf schicken."]},
    ],
    "faqs": [
        {"q": "Wie unterscheidet es sich vom eigenständigen 7-0?", "a": "Es fügt vier Dinge hinzu: den Welt-All-Stars-Modus, einen K.-o.-Lauf über vier Runden, ein Harmoniesystem und legendäre Kader von 1950 bis 2010."},
        {"q": "Was ist ein perfektes 7–0?", "a": "7–0 ist das perfekte Ergebnis. Du brauchst eine hoch bewertete Elf, jeden Spieler auf seiner Position, gute Harmonie und einen passenden Stil."},
        {"q": "Wie funktioniert Harmonie?", "a": "Im All-Stars-Modus verbindet sich jeder Spieler mit seinen Nachbarn; Landsleute erhöhen die Harmonie, isolierte Spieler senken sie."},
        {"q": "Was ist der K.-o.-Lauf?", "a": "Vier Runden mit steigender Schwierigkeit. Dieselbe Elf muss alle gewinnen, um Meister zu werden."},
        {"q": "Sind Spieler und Bewertungen echt?", "a": "Die Namen sind echte Fußballer, die Bewertungen plausible Näherungen zur Unterhaltung. Ein unabhängiges Fanprojekt ohne Verbindung zur FIFA."},
        {"q": "Ist es kostenlos und mehrsprachig?", "a": "Ja. Völlig kostenlos, ohne Konto, in sieben Sprachen."},
    ],
}

for loc in ['en', 'zh', 'ja', 'ko', 'es', 'fr', 'de']:
    path = os.path.join(LOC, f'{loc}.json')
    with open(path, encoding='utf-8') as f:
        d = json.load(f)
    d['wcGame'] = WC[loc]
    d.setdefault('pages', {})
    d['pages']['sevenZero'] = SZ[loc]
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, indent=2)
    print(f'{loc}: wcGame + pages.sevenZero injected')

print('done')
