import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plane, MapPin, Utensils, DollarSign, Clock, 
  Cloud, Home, Hotel, AlertCircle, CheckCircle, TrendingUp
} from "lucide-react";
import { motion } from "framer-motion";

export default function PlanContent({ content }) {
  if (!content) return null;

  // 分割内容为章节
  const sections = content.split(/##\s+/).filter(s => s.trim());

  const getSectionIcon = (title) => {
    if (title.includes('航班') || title.includes('✈️')) return Plane;
    if (title.includes('行程') || title.includes('📅')) return MapPin;
    if (title.includes('餐厅') || title.includes('🍽️')) return Utensils;
    if (title.includes('住宿') || title.includes('🏨')) return Hotel;
    if (title.includes('预算') || title.includes('💰')) return DollarSign;
    if (title.includes('雨季') || title.includes('🌧️')) return Cloud;
    if (title.includes('贴士') || title.includes('💡')) return AlertCircle;
    if (title.includes('景点') || title.includes('🗺️')) return MapPin;
    return CheckCircle;
  };

  const getSectionColor = (title) => {
    if (title.includes('航班')) return 'from-blue-100 to-blue-200';
    if (title.includes('行程')) return 'from-orange-100 to-orange-200';
    if (title.includes('餐厅')) return 'from-amber-100 to-amber-200';
    if (title.includes('住宿')) return 'from-purple-100 to-purple-200';
    if (title.includes('预算')) return 'from-green-100 to-green-200';
    if (title.includes('雨季')) return 'from-blue-100 to-indigo-200';
    if (title.includes('景点')) return 'from-teal-100 to-teal-200';
    return 'from-gray-100 to-gray-200';
  };

  return (
    <div className="space-y-6">
      {sections.map((section, index) => {
        const lines = section.trim().split('\n');
        const title = lines[0].replace(/[#*]/g, '').trim();
        const contentLines = lines.slice(1).join('\n').trim();
        
        const SectionIcon = getSectionIcon(title);
        const colorClass = getSectionColor(title);

        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="border-none shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300">
              <CardHeader className={`bg-gradient-to-r ${colorClass} py-4`}>
                <CardTitle className="text-lg flex items-center gap-2">
                  <SectionIcon className="w-5 h-5" />
                  {title}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="prose prose-sm max-w-none">
                  {formatContent(contentLines)}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}

function formatContent(content) {
  // 处理表格
  if (content.includes('|')) {
    const lines = content.split('\n');
    const tableLines = [];
    const otherLines = [];
    let inTable = false;

    lines.forEach(line => {
      if (line.includes('|')) {
        tableLines.push(line);
        inTable = true;
      } else {
        if (inTable && tableLines.length > 0) {
          otherLines.push(renderTable(tableLines));
          tableLines.length = 0;
          inTable = false;
        }
        otherLines.push(line);
      }
    });

    if (tableLines.length > 0) {
      otherLines.push(renderTable(tableLines));
    }

    return (
      <div className="space-y-4">
        {otherLines.map((line, i) => (
          typeof line === 'string' ? renderLine(line, i) : <div key={i}>{line}</div>
        ))}
      </div>
    );
  }

  // 普通内容
  return (
    <div className="space-y-3">
      {content.split('\n').map((line, i) => renderLine(line, i))}
    </div>
  );
}

function renderTable(lines) {
  const rows = lines.filter(l => l.trim() && !l.includes('---'));
  if (rows.length === 0) return null;

  const headers = rows[0].split('|').map(h => h.trim()).filter(h => h);
  const dataRows = rows.slice(1).map(row => 
    row.split('|').map(cell => cell.trim()).filter(cell => cell)
  );

  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-gradient-to-r from-orange-500 to-teal-500 text-white">
            {headers.map((header, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataRows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 border-t border-gray-200">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderLine(line, key) {
  if (!line.trim()) return null;

  // 三级标题
  if (line.startsWith('###')) {
    return (
      <h4 key={key} className="text-lg font-bold text-gray-900 mt-4 mb-2 flex items-center gap-2">
        <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-teal-500 rounded"></div>
        {line.replace(/###/g, '').trim()}
      </h4>
    );
  }

  // 列表项
  if (line.trim().match(/^[-*•]\s/)) {
    const content = line.replace(/^[-*•]\s/, '').trim();
    const hasPrice = content.match(/\$[\d,]+-?\d*/);
    const hasCheckmark = content.includes('✓');
    
    return (
      <div key={key} className="flex items-start gap-3 py-1 group hover:bg-orange-50 px-3 rounded-lg transition-colors">
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-500 to-teal-500 mt-2 flex-shrink-0"></div>
        <p className="text-gray-700 flex-1">
          {hasCheckmark && <span className="text-green-600 mr-2">✓</span>}
          {content}
          {hasPrice && (
            <Badge className="ml-2 bg-green-500 text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              含价格
            </Badge>
          )}
        </p>
      </div>
    );
  }

  // 强调文本 (**文本**)
  if (line.includes('**')) {
    const parts = line.split('**');
    return (
      <p key={key} className="text-gray-700 leading-relaxed">
        {parts.map((part, i) => 
          i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
        )}
      </p>
    );
  }

  // 包含来源标注的行
  if (line.includes('来源:') || line.includes('来源：')) {
    return (
      <div key={key} className="bg-blue-50 border-l-4 border-blue-500 pl-4 py-2 my-2">
        <p className="text-sm text-blue-900">{line}</p>
      </div>
    );
  }

  // 普通段落
  return (
    <p key={key} className="text-gray-700 leading-relaxed">
      {line}
    </p>
  );
}