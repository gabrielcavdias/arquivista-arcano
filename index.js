import puppeteer from 'puppeteer'
import fs from 'fs'

let alphabet = []
for (let i = 0; i < 26; i++) {
    let char = String.fromCharCode(97 + i)
    alphabet.push(char)
}
let forbidden_chars = ['k', 'u', 'y', 'x', 'w']
alphabet = alphabet
    .filter((letter) => !forbidden_chars.includes(letter))
    .map((letter) => letter.toUpperCase())

async function getMagiasByChar(char) {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const url = `https://tsrd.fandom.com/pt-br/wiki/Magias_${char}`
    await page.goto(url)

    const magias = await page.evaluate(() => {
        const spell_titles = [...document.querySelectorAll('.mw-headline')].map(
            (i) => i.innerText
        )

        // Throws a bunch of node elements
        let lists = [...document.querySelectorAll('h2')].map(
            (h2) => h2.nextElementSibling
        )

        // Select only <ul> elements
        lists = lists.filter((item) => item.tagName == 'UL')

        // And only those without HTML Classes
        lists = lists.filter((ul) => ul.classList.length == 0)

        // Then only the list with text
        lists = lists.map((ul) => {
            return [...ul.children].map((item) => item.innerText)
        })

        // The content of the table with spell description
        const body = [...document.querySelectorAll('.article-table')].map(
            (table) => table.innerText
        )

        return spell_titles.map((title, index) => {
            return {
                name: title,
                attributes: lists[index],
                body: body[index],
            }
        })
    })

    await browser.close()

    fs.writeFile(
        `./magias/magias_${char}.json`,
        JSON.stringify(magias),
        (error) => (error ? error : '')
    )
}

async function loopAlphabet() {
    for (let i = 0; i < alphabet.length; i++) {
        await getMagiasByChar(alphabet[i])
        console.log(`Magias da letra ${alphabet[i]} salvas`)
    }
}
loopAlphabet()
