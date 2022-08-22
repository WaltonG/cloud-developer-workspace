import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios from 'axios'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

const cert = `-----BEGIN CERTIFICATE-----
MIIDATCCAemgAwIBAgIJBmlNvhzzBfnqMA0GCSqGSIb3DQEBCwUAMB4xHDAaBgNV
BAMTE3dhbHRvbi51cy5hdXRoMC5jb20wHhcNMjIwODIyMDk1NjM5WhcNMzYwNDMw
MDk1NjM5WjAeMRwwGgYDVQQDExN3YWx0b24udXMuYXV0aDAuY29tMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuk8m/cROl1jpGmRNK3sI1LpMSmCXBWmI
u8lufIeSwsS87r8M/Fv0OXpesnGCdqCmkZrHXOsmQDmiHJvXw/rxXZWGWm/ApuuJ
jW0KwzLaQ+f4eA+mKES8d2xttwGIyfImN3tN6j3MBB1/shsjwUgLHD81gvdBOWAz
0Qnd1nHmPmfMCdVUefuDjQEvuI/QSLtBnOvQb4GOwCs0GzO3FTJFsoTO8ONyeahh
AUxTvh6Y8OdO+XzD8ulEK428etKjjD45WsNqa4fpGoDqfD2p7S9NsJWt5bGVYi9h
DoFrQFrjB4NCiN+6hS34ONmx7guay9OYyI9TOHjW7xKLK7CiIKLuXwIDAQABo0Iw
QDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBS4/l+nuLYjXHRMgRCBpoo3wivN
3DAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEBAIWlD/RL0hOi84ku
eWeIkCHXL2zTkeowA7YN1IWal2F9KQ7ADEiTskJEuALq+E13ecz4Tc04ovoELWvz
bCe2Y8zBB3t9SY/wd57OUvSEcOKamrA3vdasI/47d6ZvbAFMDlUTv3C3rVf75XIX
0Rilv0IrRbM9Eq1AElAe9q3GnWRKx44mKNRee27d221rC0bgsFOx7zArEEsaJKAF
My8a9JL0wDNJ3bF+0JbYPmekO7SR2JazXKxGp6TKiHqDcQnPCOYcbbnDwIqO1DVr
VGpbxhJ2Y1+LzzpQvazUy8wD/TV/NZFFSi7wizm1cC2Co1Cm4K1CSyhQXSKrEesj
Z+Q44mE=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('Auth successful')

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (error) {
    logger.error('You are not allowed to perform this action', {
      error: error.message
    })
    // revoke auth if failed
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)

  logger.info(`Verifying token ${token}`)

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
