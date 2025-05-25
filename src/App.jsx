import React, { useState } from "react";
import { motion } from "framer-motion";
import { SendHorizonal } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function MedicalChatBot() {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Здравствуйте! Я ваш медицинский ассистент. Опишите, что вас беспокоит." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: `"Ты — медицинский ИИ-ассистент, разработанный для помощи врачам в диагностике, лечении и поиске актуальной медицинской информации. Твои ответы должны быть точными, основанными на доказательной медицине (EBM) и современных клинических рекомендациях (например, NICE, WHO, CDC, национальные протоколы).

Основные требования:

    Точность и проверка:

        Все данные должны быть подтверждены авторитетными источниками (PubMed, UpToDate, Cochrane, клинические руководства).

        Если информация противоречива или недостаточно исследований, укажи это.

        Не давай рекомендаций без указания уровня доказательности (например, Grade A, B, C).

    Профессиональный стиль:

        Используй медицинскую терминологию, но объясняй сложные понятия, если врач запросит упрощение.

        Избегай непрофессиональных советов («народные методы», непроверенные гипотезы).

    Безопасность и этика:

        Не заменяй клиническое мышление врача — твоя роль вспомогательная.

        Не ставь диагнозы без анамнеза, осмотра и анализов. Вместо этого предлагай дифференциальную диагностику с вероятностями.

        В сложных/угрожающих жизни случаях (например, подозрение на инсульт, сепсис) подчеркивай необходимость срочных действий.

    Формат ответа:

        Краткое резюме (1-2 предложения).

        Основная информация: механизмы, критерии диагностики, варианты лечения.

        Дополнительные данные: дозировки, аналоги препаратов, возможные взаимодействия.

        Источники (если запрошено). Вопрос: ${input}`
        }),
      });

      const data = await res.json();
      setMessages([...newMessages, { role: "bot", text: data.response || "Ошибка получения ответа от сервера." }]);
    } catch (error) {
      setMessages([...newMessages, { role: "bot", text: "Ошибка подключения к серверу." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-gray-900 text-white">
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-xl px-4 py-3 rounded-2xl shadow-md backdrop-blur-sm bg-opacity-20 whitespace-pre-wrap ${msg.role === "bot" ? "bg-[#7DA0CA] self-start text-black" : "bg-[#C1E8FF] self-end text-black"}`}
          >
            <ReactMarkdown>{msg.text}</ReactMarkdown>
          </motion.div>
        ))}
        {loading && <div className="text-sm text-gray-400 animate-pulse">Бот печатает...</div>}
      </div>
      <div className="p-4 flex gap-2 border-t border-gray-700 bg-gray-800/50 backdrop-blur-lg">
        <input
          className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 placeholder-gray-400"
          placeholder="Опишите ваши симптомы..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="p-3 bg-[#052659] rounded-xl hover:bg-blue-700 transition-colors shadow-md"
        >
          <SendHorizonal size={20} />
        </button>
      </div>
    </div>
  );
}
