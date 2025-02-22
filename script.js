const apiToken = '73532256927db281cb8ba852d4a2f8fc73e95428f04b8118300c4adfa74d5dbb';
const ApiUrl = 'https://api.together.xyz/v1/chat/completions';

async function analyzeEmotions(analysisType) {
    const text = document.getElementById('text-input').value.trim();
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');
    const customInstruction = document.getElementById('custom-instruction').value.trim();

    if (!text) {
        resultDiv.innerHTML = '<div class="error">❗ Пожалуйста, введите текст для анализа.</div>';
        return;
    }

    loadingDiv.style.display = 'block';
    resultDiv.innerHTML = '';

    const cleanedText = text.replace(/,/g, '');
    let prompt;

    if (analysisType === 'simple') {
        // Легкий промпт для простого анализа
        prompt = `Проанализируй текст: '${cleanedText}'

Определи жанр (художественный, публицистический, научный, технический, инструктивный).
Определи цель (информировать, убеждать, вызывать эмоции, обучать).
Разбери тон и эмоции, если они уместны (например, в художественном или публицистическом тексте).
Проанализируй язык: стиль, сложность, метафоры, аллюзии, влияние на восприятие.
Выяви скрытые смыслы (если есть), двусмысленности, возможные интерпретации.
Дай человеческую оценку: насколько текст понятен, логичен, вызывает ли эмоции, можно ли его улучшить?
Анализируй осмысленно, без шаблонов. Думай, как человек.Не включай исходный текст в ответ, только анализ.`;
    } else if (analysisType === 'advanced') {
        // Подробный промпт для продвинутого анализа
        prompt = ` Проанализируй текст: '${cleanedText}'Подойди к анализу так, как сделал бы человек, учитывая контекст, стиль и цели текста. Не ограничивайся шаблонным разбором – размышляй и интерпретируй осмысленно.

Определение жанра и цели текста

Какой это тип текста: художественный, публицистический, научный, технический, инструктивный?
Какова его основная функция: информировать, убеждать, вызывать эмоции, обучать?
Анализ эмоций и тональности (только если уместно)

Если текст художественный или публицистический, разбери его эмоциональный фон.
Не анализируй эмоции там, где их быть не должно (например, в инструкциях или технических документах).
Если тональность текста кажется сухой или нейтральной, оцени, делает ли это его более объективным или, наоборот, скрыто манипулятивным.
Разбор языка и стилистики

Какие приемы использованы: формальный язык, разговорные элементы, сложные синтаксические конструкции?
Есть ли метафоры, сравнения, эпитеты, символика, аллюзии?
Как стиль влияет на восприятие текста?
Глубинный смысл и подтексты (если есть)

Если это художественный текст, какие скрытые мотивы или символы в нем можно обнаружить?
Если это технический текст, логично ли изложены инструкции, нет ли двусмысленности?
Может ли текст быть истолкован по-разному в зависимости от контекста?
Человеческий взгляд на текст

Если это инструкция, насколько она понятна и удобна для человека? Есть ли в ней ошибки, двусмысленности, непонятные формулировки?
Если это художественный текст, насколько он вызывает живые эмоции, легко ли он воспринимается?
Как текст мог бы быть улучшен, чтобы лучше выполнять свою функцию?
Выполни анализ осмысленно, избегая шаблонных выводов. Думай так, как если бы ты сам читал этот текст и пытался разобраться в нем по-настоящему.Не включай исходный текст в ответ, только анализ.`;
    }

    // Добавляем уточнение от пользователя, если оно есть
    if (customInstruction) {
        prompt += ` Учти следующее: ${customInstruction}`;
    }

    const data = {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free', // Фиксированная модель
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
    };

    try {
        const response = await fetch(ApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const responseData = await response.json();
        loadingDiv.style.display = 'none';
        displayEmotions(responseData);
    } catch (error) {
        loadingDiv.style.display = 'none';
        resultDiv.innerHTML = `<div class="error">⚠️ Ошибка: ${error.message}</div>`;
    }
}
// Функция для отправки вопроса по выделенному тексту
async function askQuestion() {
    const selectedText = window.getSelection().toString().trim();
    const resultDiv = document.getElementById('result');
    const loadingDiv = document.getElementById('loading');

    if (!selectedText) {
        resultDiv.innerHTML = '<div class="error">❗ Пожалуйста, выделите текст, чтобы задать вопрос.</div>';
        return;
    }

    const question = prompt('Введите ваш вопрос по выделенному тексту:');
    if (!question) {
        resultDiv.innerHTML = '<div class="error">❗ Вопрос не был введен.</div>';
        return;
    }

    loadingDiv.style.display = 'block';
    resultDiv.innerHTML = '';

    const promptText = `Текст: "${selectedText}"\n\nВопрос: ${question}\n\nОтветь на вопрос, используя контекст текста.`;

    const data = {
        model: 'meta-llama/Llama-3.3-70B-Instruct-Turbo-Free',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 1000
    };

    try {
        const response = await fetch(ApiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }

        const responseData = await response.json();
        loadingDiv.style.display = 'none';
        displayQuestionAnswer(responseData);
    } catch (error) {
        loadingDiv.style.display = 'none';
        resultDiv.innerHTML = `<div class="error">⚠️ Ошибка: ${error.message}</div>`;
    }
}

// Функция для отображения ответа на вопрос
function displayQuestionAnswer(data) {
    const resultDiv = document.getElementById('result');
    if (!data || !data.choices || data.choices.length === 0) {
        resultDiv.innerHTML = '<div class="error">⚠️ Не удалось получить ответ на вопрос.</div>';
        return;
    }

    const answerText = data.choices[0].message.content;
    resultDiv.innerHTML = `
        <div class="analysis-container">
            <h2>📖 Ответ на ваш вопрос:</h2>
            <div class="text-container">${answerText}</div>
        </div>
    `;
}

function displayEmotions(data) {
    const resultDiv = document.getElementById('result');
    if (!data || !data.choices || data.choices.length === 0) {
        resultDiv.innerHTML = '<div class="error">⚠️ Не удалось провести полный анализ.</div>';
        return;
    }

    const analysisText = data.choices[0].message.content;
    const formattedAnalysis = formatAnalysis(analysisText);

    resultDiv.innerHTML = `
        <div class="analysis-container">
            <h2>📖 Результат анализа:</h2>
            ${formattedAnalysis}
        </div>
    `;
}

function formatAnalysis(text) {
    const cleanedText = text
        .replace(/[^\p{L}\p{N}\s.,!?\-:]/gu, '') // Удаляем лишние символы
        .replace(/^\s*[\d\-*•]+\.?\s*/gm, '') // Удаляем маркеры списков
        .split(/[.!?]/) // Разбиваем текст на предложения
        .filter(sentence => !/[\p{Script=Han}]/u.test(sentence)) // Удаляем предложения с китайскими иероглифами
        .join('. ') // Собираем обратно
        .trim();

    return `<div class="text-container">${cleanedText
        .split(/\n\n+/) // Разделяем на секции
        .map(section => {
            const lines = section
                .split('\n')
                .filter(line => line.trim())
                .map(line => line.replace(/^[:]\s*/, '')); // Убираем лишние символы

            if (!lines.length) return '';

            return `
                <div class="section">
                    ${lines[0] ? `<h3 class="section-title">${lines[0]}</h3>` : ''}
                    ${lines.slice(1).map(line => 
                        `<div class="section-line">
                            <div class="decorator"></div>
                            <p>${line}</p>
                        </div>`
                    ).join('')}
                </div>
            `;
        })
        .join('')}</div>`;
}
// Получаем элементы
const exportBtn = document.getElementById('export-btn');
const modal = document.getElementById('export-modal');
const closeModal = document.getElementById('close-modal');
const exportTxtBtn = document.getElementById('export-txt');
const exportDocxBtn = document.getElementById('export-docx');

// Открытие модального окна
exportBtn.addEventListener('click', function () {
    modal.style.display = 'block';
});

// Закрытие модального окна
closeModal.addEventListener('click', function () {
    modal.style.display = 'none';
});

// Экспорт в .txt
exportTxtBtn.addEventListener('click', function () {
    const resultText = document.getElementById('result').innerText;
    const textInput = document.getElementById('text-input').value;
    const customInstruction = document.getElementById('custom-instruction').value;

    // Проверяем, был ли выполнен анализ
    if (!resultText.trim()) {
        alert("Сначала выполните анализ текста, чтобы экспортировать результат.");
        return;
    }

    // Формируем контент для текстового файла
    const content = `
        Текст для анализа:
        ------------------------
        ${textInput}

        Уточнение для анализа:
        ------------------------
        ${customInstruction}

        ------------------------
        ${resultText}
    `;

    // Формируем Blob для .txt
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    saveAs(blob, 'analysis_result.txt');
    modal.style.display = 'none';  // Закрываем окно после экспорта
});



// Функция для сохранения файла (используется FileSaver.js)
function saveAs(blob, fileName) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}

function clearText() {
    document.getElementById('text-input').value = '';
    document.getElementById('custom-instruction').value = '';
    document.getElementById('result').innerHTML = '';
}

async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('text-input').value = text;
    } catch (error) {
        alert('Не удалось вставить текст из буфера обмена.');
    }
}

document.getElementById('simple-analysis-btn').addEventListener('click', () => analyzeEmotions('simple'));
document.getElementById('advanced-analysis-btn').addEventListener('click', () => analyzeEmotions('advanced'));
document.getElementById('paste-btn').addEventListener('click', pasteText);
document.getElementById('clear-btn').addEventListener('click', clearText);