export default function weekToChinese (value) {
  switch (value) {
    case 'Monday':
      return '一'
    case 'Tuesday':
      return '二'
    case 'Wednesday':
      return '三'
    case 'Thursday':
      return '四'
    case 'Friday':
      return '五'
    case 'Saturday':
      return '六'
    case 'Sunday':
      return '日'
    default:
      return ''
  }
}
