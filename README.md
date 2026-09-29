# Vicson Yaris · Data Analyst Portfolio

Live site: https://spark-829.github.io/VicsonYaris_Portfolio

A single-page portfolio built with plain HTML, CSS and JavaScript (no build step), served by GitHub Pages.

The featured case study is a four-page Power BI report on the [Olist Brazilian E-Commerce dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce): 99,441 orders placed between 2016 and 2018. The key visuals are rebuilt as interactive SVG charts in `script.js`, so they stay sharp and work in dark mode.

## The Power BI report

`VicsonYaris_Portfolio.pdf` is the full four-page report, exported from Power BI Desktop. Each report tab on the site shows the matching page as an image from `assets/dashboard/` (`overview.png`, `customers.png`, `delivery.png`, `products.png`). These images are rendered from the PDF.

When the report changes, export the PDF again and regenerate the four PNGs. Any slot whose image is missing stays hidden.

## Files

- `index.html`: all page content
- `style.css`: layout and the light and dark themes
- `script.js`: chart data and rendering, report tabs, theme toggle, mobile menu
