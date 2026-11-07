"""Gera o cartaz do cardápio (HTML -> PNG + PDF A3) usando o Edge em modo headless.
Uso: python cardapio-salao/gerar.py   (edite CATEGORIAS abaixo para mudar o conteúdo)"""
import html
import pathlib
import subprocess
import time

from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent
IMG = "../public/img/"

# (título, subtítulo, [(marca, sabor, arquivo, limitado)])
CATEGORIAS = [
    ("Destilados", "Para os que não têm medo do escuro", [
        ("Vodka", "", "vodka", False),
        ("Askov", "Azul", "askov_azul", False),
        ("Askov", "Vermelha", "askov_vermelha", False),
        ("Askov", "Amarela", "askov_amarela", False),
        ("Gin", "Azul", "gin_azul", False),
        ("Gin", "Rosa", "gin_rosa", False),
        ("Tekiloca", "", "tequiloka", False),
        ("Jurupinga", "", "jurupinga", False),
    ]),
    ("Mistas & Ice", "Geladas, doces e perigosas", [
        ("Skol Beats", "Azul", "skol_beats_azul", False),
        ("Skol Beats", "GT", "skol_beats_gt", False),
        ("Skol Beats", "Rosa", "skol_beats_rosa", False),
        ("Ice", "Maçã verde", "ice_maca_verde", True),
        ("Ice", "Frutas tropicais", "ice_frutas_tropicais", True),
    ]),
    ("Cervejas & Vinho", "Para brindar com os mortos", [
        ("Brahma", "Duplo Malte", "brahma_duplo_malte", False),
        ("Dom Bosco", "", "dom_bosco", False),
    ]),
    ("Sem álcool", "Para misturar ou sobreviver", [
        ("Coca-Cola", "", "coca_cola", False),
        ("Guaraná", "", "guarana", False),
        ("Fanta", "Uva", "fanta_uva", False),
        ("Vibe", "Energético", "energetico_vibe", False),
        ("Baly", "Maçã verde", "energetico_baly_maca_verde", False),
        ("Baly", "Melancia", "energetico_baly_melancia", False),
        ("Água", "", "agua", False),
    ]),
]


def item(marca, sabor, arq, limitado):
    badge = '<span class="ltd">Estoque<br>limitadíssimo</span>' if limitado else ""
    sub = f'<span class="sub">{html.escape(sabor)}</span>' if sabor else '<span class="sub">&nbsp;</span>'
    return f'<li>{badge}<img src="{IMG}{arq}.webp" alt=""><span class="nome">{html.escape(marca)}</span>{sub}</li>'


bands = ""
for titulo, subt, itens in CATEGORIAS:
    lis = "".join(item(*i) for i in itens)
    bands += (
        f"<section><header><h2>{html.escape(titulo)}</h2><p>{html.escape(subt)}</p></header>"
        f'<ul class="n{len(itens)}">{lis}</ul></section>'
    )

CSS = """
* { box-sizing: border-box; margin: 0; padding: 0 }
html, body { width: 1190px; height: 1684px; background: #050505 }
body { position: relative; overflow: hidden; color: #d9d3c9; font-family: "Cormorant Garamond", serif;
  background:
    radial-gradient(ellipse 70% 38% at 50% 0%, rgba(142,14,18,.55), transparent 70%),
    radial-gradient(ellipse 80% 30% at 50% 100%, rgba(142,14,18,.45), transparent 70%),
    #050505; }
.frame { position: absolute; inset: 26px; border: 1px solid #8e0e12; pointer-events: none }
.frame::after { content: ""; position: absolute; inset: 8px; border: 1px solid #1f1c1b }
.wrap { position: absolute; inset: 56px 64px 48px; display: flex; flex-direction: column }
.mono { font-family: "IBM Plex Mono", monospace; text-transform: uppercase }
.top { text-align: center }
.top .eyebrow { font-size: 15px; letter-spacing: .42em; color: #d11a1a }
h1 { font-weight: 300; text-transform: uppercase; letter-spacing: .1em; font-size: 112px; line-height: .9; margin-top: 14px; color: #e8e2d6;
  text-shadow: 0 0 40px rgba(209,26,26,.45) }
.top .party { margin-top: 16px; font-size: 18px; letter-spacing: .34em; color: #857f77 }
.rule { height: 1px; margin: 22px auto 0; width: 360px; background: linear-gradient(90deg, transparent, #8e0e12, transparent) }
.info { margin-top: 18px; display: flex; justify-content: center; gap: 28px; font-size: 15px; letter-spacing: .22em; color: #d9d3c9 }
.addr { margin-top: 10px; font-size: 15px; letter-spacing: .22em; color: #d9d3c9; text-align: center }
.info i { color: #d11a1a; font-style: normal }
main { flex: 1; display: flex; flex-direction: column; justify-content: space-between; margin-top: 20px }
section header { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 1px solid #8e0e12; padding-bottom: 8px }
h2 { font-weight: 400; text-transform: uppercase; letter-spacing: .14em; font-size: 38px; color: #e8e2d6 }
section header p { font-style: italic; font-size: 22px; color: #857f77 }
ul { list-style: none; display: flex; justify-content: space-evenly; align-items: flex-end; margin-top: 12px; padding: 14px 10px 10px;
  background: radial-gradient(ellipse 90% 70% at 50% 100%, #fffdf8, #ece7dc 80%); border-radius: 3px; box-shadow: inset 0 0 40px rgba(0,0,0,.18) }
li { position: relative; flex: 1 1 0; min-width: 0; display: flex; flex-direction: column; align-items: center; text-align: center }
li img { position: relative; z-index: 1; height: 170px; max-width: 92%; object-fit: contain; mix-blend-mode: multiply }
li::before { content: ""; position: absolute; left: 18%; right: 18%; top: 158px; height: 14px; border-radius: 50%;
  background: radial-gradient(ellipse, rgba(0,0,0,.28), transparent 70%); z-index: 0 }
.nome { margin-top: 8px; font-weight: 500; font-size: 25px; line-height: 1; color: #1a1514; letter-spacing: .02em }
.sub { margin-top: 4px; font-family: "IBM Plex Mono", monospace; text-transform: uppercase; font-size: 11.5px; letter-spacing: .16em; color: #8e0e12; font-weight: 500 }
.n8 .nome { font-size: 22px } .n8 li img { height: 160px } .n8 li::before { top: 148px }
.n7 .nome { font-size: 23px } .n7 li img { height: 165px } .n7 li::before { top: 153px }
.n2 { justify-content: center; gap: 200px } .n2 li { flex: 0 0 230px } .n2 li img { height: 175px } .n2 li::before { top: 163px }
.n2 .nome { font-size: 30px } .n2 .sub { font-size: 13px }
.n5 li img { height: 175px } .n5 li::before { top: 163px } .n5 .nome { font-size: 28px }
.ltd { position: absolute; top: 0; right: 6%; z-index: 2; background: #8e0e12; color: #f4efe6; font-family: "IBM Plex Mono", monospace; text-transform: uppercase;
  font-size: 9.5px; letter-spacing: .12em; line-height: 1.35; padding: 5px 8px; text-align: center; transform: rotate(6deg); box-shadow: 0 3px 8px rgba(0,0,0,.35) }
footer { margin-top: 22px; display: flex; align-items: center; justify-content: center; gap: 22px; font-size: 13px; letter-spacing: .2em; color: #857f77 }
.age { width: 46px; height: 46px; border-radius: 50%; border: 2px solid #d11a1a; color: #d11a1a; display: flex; align-items: center; justify-content: center;
  font-family: "IBM Plex Mono", monospace; font-weight: 500; font-size: 17px; letter-spacing: 0 }
"""

FONTS = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=IBM+Plex+Mono:wght@400;500&display=swap"

page = f"""<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<title>Cardápio — The Rocky Horror Party</title>
<link href="{FONTS}" rel="stylesheet">
<style>{CSS}</style></head>
<body>
<div class="frame"></div>
<div class="wrap">
  <div class="top">
    <p class="mono eyebrow">Mansão dos Horrores</p>
    <h1>Cardápio</h1>
    <p class="mono party">The Rocky Horror Party</p>
    <div class="rule"></div>
    <p class="mono info"><span>07.11.2026</span><i>/</i><span>23h — 05h</span></p>
    <p class="mono addr">Rua Major Diogo, 518 — Bela Vista · São Paulo, SP</p>
  </div>
  <main>{bands}</main>
  <footer><span class="age">18</span><span class="mono">Bebidas alcoólicas proibidas para menores de 18 anos · Beba com moderação</span></footer>
</div>
</body></html>"""

(ROOT / "cardapio.html").write_text(page, encoding="utf-8")

edge = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
png_path = ROOT / "cardapio-salao.png"
if png_path.exists():
    png_path.unlink()
subprocess.run(
    [edge, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
     "--virtual-time-budget=15000", "--force-device-scale-factor=3", "--window-size=1190,1684",
     f"--screenshot={png_path}", (ROOT / "cardapio.html").as_uri()],
    check=True,
)
# o Edge pode devolver o controle antes de terminar de gravar o arquivo
for _ in range(60):
    if png_path.exists() and png_path.stat().st_size > 100_000:
        time.sleep(1)
        break
    time.sleep(1)

# PDF de página única, tamanho A3 (297 x 420 mm), a partir do PNG
png = Image.open(png_path).convert("RGB")
png.save(ROOT / "cardapio-salao.pdf", resolution=png.width / (297 / 25.4))
print("ok", png.size)
