import { handleSecurityDecision } from '../../../../lib/securityReview'

export default function handler(req, res) {
  return handleSecurityDecision(req, res, 'reject')
}
