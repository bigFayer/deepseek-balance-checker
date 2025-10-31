import React from 'react'
import { motion } from 'framer-motion'
import { Shield, Zap, BarChart3, Clock, CheckCircle, Globe } from 'lucide-react'

const Features = () => {
  const features = [
    {
      icon: Shield,
      title: '安全可靠',
      description: '您的 API 密钥不会被存储或记录，查询请求直接发送到 DeepSeek 服务器',
    },
    {
      icon: Zap,
      title: '快速查询',
      description: '优化的查询流程，快速获取您的 API 余额和使用情况',
    },
    {
      icon: BarChart3,
      title: '详细统计',
      description: '显示总授予额度、已使用额度和当前余额，一目了然',
    },
    {
      icon: Clock,
      title: '实时更新',
      description: '获取最新的余额信息，帮助您更好地管理 API 使用',
    },
    {
      icon: CheckCircle,
      title: '简单易用',
      description: '简洁直观的界面设计，无需复杂操作即可查询余额',
    },
    {
      icon: Globe,
      title: '全球可用',
      description: '无论您身在何处，都可以随时随地查询您的 API 余额',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-12"
    >
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">功能特性</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          我们提供安全、快速、便捷的 DeepSeek API 余额查询服务
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="card p-6 h-full"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-primary-100 rounded-lg mb-4">
              <feature.icon className="h-6 w-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default Features
