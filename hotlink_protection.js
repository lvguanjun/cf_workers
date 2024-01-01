addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

const handleRequest = async (request) => {
    const url = new URL(request.url)
    const referer = request.headers.get('Referer') || ''
    const expectedReferer = `https://${url.host}/`
    const isInvalidReferer = request.method === 'POST' && referer !== expectedReferer

    // 判断请求是否为POST，以及referer是否不符合预期
    if (isInvalidReferer) {
        const n = Math.floor(Math.random() * 8) + 3; // 随机数组长度 3-10
        const timestamp = Math.floor(Date.now() / 1000);
        var punctuation_1 = ["，", "！", "？"];
        var punctuation_2 = ["！", "。", "？"];
        const responseBodies = [
            {
                "id": "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
                "object": "chat.completion.chunk",
                "created": timestamp,
                "model": "gpt-4",
                "choices": [
                    {
                        "delta": {
                            "role": "assistant"
                        },
                        "index": 0,
                        "finish_reason": null
                    }
                ]
            },
            ...Array(n).fill().map((_, i) => {
                return {
                    "id": "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
                    "object": "chat.completion.chunk",
                    "created": timestamp,
                    "model": "gpt-4",
                    "choices": [
                        {
                            "delta": {
                                "content": "喵".repeat(Math.floor(Math.random() * 10) + 1) + punctuation_1[Math.floor(Math.random() * punctuation_1.length)]
                            },
                            "index": 0,
                            "finish_reason": null
                        }
                    ]
                };
            }),
            {
                "id": "chatcmpl-KstKFAQWPLB2sFepfNFWdkRXb5F48",
                "object": "chat.completion.chunk",
                "created": timestamp,
                "model": "gpt-4",
                "choices": [
                    {
                        "delta": {
                            "content": "喵".repeat(Math.floor(Math.random() * 10) + 1) + punctuation_2[Math.floor(Math.random() * punctuation_2.length)]
                        },
                        "index": 0,
                        "finish_reason": "stop"
                    }
                ]
            },
            "data: [DONE]"
        ];
        let response = '';
        for (let body of responseBodies) {
            response += "data: " + JSON.stringify(body) + "\n\n";
        }

        return new Response(response, {
            status: 200,
            headers: {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Transfer-Encoding': 'chunked',
                'Access-Control-Allow-Origin': '*',
            },
        })
    }

    // 如果不满足上述条件，正常处理请求
    return fetch(request)
}
