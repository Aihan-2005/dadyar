import type { FAQItem } from '@/types/faq'
import type { ApiFAQRecord } from './types'

export function fromApiFaq(record: ApiFAQRecord): FAQItem {
  return {
    id: record._id,
    question: record.question,
    answer: record.answer,
  }
}