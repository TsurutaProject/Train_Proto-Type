# Train Proto-Type

小学生が「速さ・時間・距離」の関係を、レール配置ゲームとして体験できるReact製のプロトタイプです。

プレイヤーはスタートからゴールまでレールをつなぎ、電車が目標時間に近いタイミングで到着するようにルートを考えます。

## 目的

- 算数の「速さ」「時間」「距離」を直感的に理解できるようにする
- 電車とレールを題材にして、学習感を強く出しすぎずゲームとして遊べるようにする
- 小学生でもクリック操作だけで遊べるWebアプリにする

## 主な機能

- ステージ選択
- 低速レール・高速レールの配置
- スタート、ゴール、中継地点の表示
- スタートからゴールまでの接続判定
- 中継地点を通るルート判定
- 最短経路の予想時間表示
- 最短経路に沿ったレール形状の自動調整
- 電車がレール上を走るアニメーション
- リザルト表示

## 遊び方

1. タイトル画面で `START` を押します。
2. 遊ぶステージを選びます。
3. レール置き場から使いたいレールを選びます。
4. 盤面の空きマスをクリックしてレールを配置します。
5. スタートからゴールまでレールをつなぎます。
6. `出発` を押すと、電車が最短経路を走ります。
7. 目標時間と実際の時間の差がリザルトに表示されます。

## レールの種類

| 種類 | 速さ | 時間 |
| --- | --- | --- |
| 低速レール | 1マス/秒 | 1マスあたり1秒 |
| 高速レール | 2マス/秒 | 1マスあたり0.5秒 |

## 技術構成

- React
- Vite
- JavaScript
- CSS
- Docker

## 起動方法

Dockerを使って起動します。

```bash
docker run -it --rm -v "$PWD":/app -w /app -p 5173:5173 node:24-slim sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

起動後、ブラウザで以下を開きます。

```text
http://localhost:5173/
```

## 日本語パスでDockerが失敗する場合

macOS + Docker環境で、日本語を含むフォルダをマウントすると `Unknown system error -35` が出る場合があります。

その場合は、英数字だけのフォルダへコピーしてから起動します。

```bash
rm -rf ~/Documents/Codex/game-app-run
mkdir -p ~/Documents/Codex/game-app-run

cp package.json package-lock.json index.html vite.config.js eslint.config.js README.md ~/Documents/Codex/game-app-run/
cp -R src public ~/Documents/Codex/game-app-run/

cd ~/Documents/Codex/game-app-run
docker run -it --rm -v "$PWD":/app -w /app -p 5173:5173 node:24-slim sh -c "npm install && npm run dev -- --host 0.0.0.0"
```

## よく使うコマンド

```bash
npm run dev
npm run build
npm run lint
```

Docker内で実行する場合は、以下のようにします。

```bash
docker run -it --rm -v "$PWD":/app -w /app node:24-slim npm run lint
```

## フォルダ構成

```text
.
├── public/
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
├── package-lock.json
└── vite.config.js
```

## 今後の改善案

- レールの種類を増やす
- ステージ数を増やす
- 障害物マスを追加する
- 到着時間に応じてスコアを表示する
- スマートフォンでの操作性をさらに調整する

## 開発メモ

このプロトタイプでは、盤面上の配置済みレールから最短経路を計算し、その経路上のレールだけを予想時間の対象にしています。

余分に置かれたレールは、最短経路に含まれない限り予想時間には入りません。
