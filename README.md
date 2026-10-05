# Vicson Yaris · Data Analyst Portfolio

Live site: https://spark-829.github.io/VicsonYaris_Portfolio

A single-page portfolio built with plain HTML, CSS and JavaScript (no build step), served by GitHub Pages.

The featured case study is a four-page Power BI report on the [Olist Brazilian E-Commerce dataset](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce): 99,441 orders placed between 2016 and 2018. The key visuals are rebuilt as interactive SVG charts in `script.js`, so they stay sharp and work in dark mode.

## The Power BI report

`VicsonYaris_Portfolio.pdf` is the full four-page report, exported from Power BI Desktop. Each report tab on the site shows the matching page as an image from `assets/dashboard/` (`overview.png`, `customers.png`, `delivery.png`, `products.png`). These images are rendered from the PDF.

When the report changes, export the PDF again and regenerate the four PNGs. Any slot whose image is missing stays hidden.

## The Excel case study

A sales and distribution workbook for a fictional FMCG distributor in North Luzon, built in Excel with formulas, PivotTables, slicers and VBA. The data is synthetic (generated with a Python script), and the site says so.

- `downloads/VicsonYaris_FMCG_Sales_Excel.xlsm`: the workbook visitors can download
- The tabs embed the live workbook from SharePoint (Excel for the web). The embedded file is a separate macro-free, view-only copy (`VicsonYaris_FMCG_Sales_Web.xlsx` in the Excel project folder): every sheet is protected except the filter dropdowns and slicers.
- The chart data in `script.js` (`XL`) and the figures in the Excel section of `index.html` come from the workbook. When the workbook changes, update both.

The workbook's source (generator, build script, VBA modules) lives outside this repo, in the Excel project folder.

## Files

- `index.html`: all page content
- `style.css`: layout and the light and dark themes
- `script.js`: chart data and rendering for both case studies, report tabs, theme toggle, mobile menu
