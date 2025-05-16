import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "weather",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// ツールの一覧を定義
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get_forecast",
                description: "指定した位置の天気予報を取得します",
                inputSchema: {
                    type: "object",
                    properties: {
                        latitude: {
                            type: "number",
                            description: "緯度",
                        },
                        longitude: {
                            type: "number",
                            description: "経度",
                        },
                    },
                    required: ["latitude", "longitude"],
                },
            },
        ],
    };
});
// ツールの実行処理を定義
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name !== "get_forecast") {
        throw new Error("Unknown tool");
    }
    const { latitude, longitude } = request.params.arguments;
    // ここで外部APIを呼び出して天気予報を取得する処理を実装
    const forecastText = `緯度${latitude}、経度${longitude}の天気予報です。`;
    return {
        content: [
            {
                type: "text",
                text: forecastText,
            },
        ],
    };
});
// サーバーを起動
const transport = new StdioServerTransport();
await server.connect(transport);
