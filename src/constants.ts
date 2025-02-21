export const TEXTS = {
  TITLE: '小红书加微引导图生成器',
  IMPORTANT_NOTICE: '⚠️ 重要提示',
  RISK_WARNING: '本工具不保证100%不被识别，切勿用于违法行为，使用时请自行承担风险。',
  USAGE_TITLE: '📝【使用方法】',
  USAGE_STEPS: {
    STEP1: '手机端需在浏览器打开链接才能下载图片，输入你的微信号，上下引导语可以自发挥',
    STEP2: '选择背景样式生成图片',
    STEP3: '手动保存图片，添加到小红书表情包'
  },
  FONT_OPTIONS: {
    DEFAULT: '默认字体',
    SERIF: '衬线字体',
    ELEGANT: '优雅字体',
    BOLD: '粗体字体',
    CUTE: '可爱字体'
  },
  INPUTS: {
    TOP_TEXT: {
      LABEL: '顶部引导语',
      PLACEHOLDER: '例如: 聪明的你一定可以看到地球号'
    },
    WECHAT: {
      LABEL: '微信号',
      REQUIRED: '*'
    },
    BOTTOM_TEXT: {
      LABEL: '底部引导语',
      PLACEHOLDER: '例如: 以上全都都是英文字母'
    },
    FONT_SETTINGS: {
      TITLE: '字体设置',
      SIZE: '字体大小',
      STYLE: '字体样式'
    },
    BACKGROUND: {
      TITLE: '背景样式',
      LINES: '彩色干扰线',
      EMOJI: '随机Emoji',
      DYNAMIC: '动态效果'
    }
  },
  BUTTONS: {
    GENERATE: {
      DEFAULT: '生成图片',
      GENERATING: '生成图片...'
    }
  },
  TIPS: {
    TITLE: '💡 建议：',
    ITEMS: [
      '多生成几张不同的图轮换使用',
      '使用此工具若判违规，与本人无关，请谨慎使用'
    ]
  }
} as const; 