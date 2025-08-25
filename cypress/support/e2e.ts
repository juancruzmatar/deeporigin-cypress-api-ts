// You can add shared hooks or custom commands here
// For example, a small helper to GET/POST quickly.
Cypress.Commands.add('api', (method: string, url: string, body?: any) => {
  return cy.request({
    method: method as any,
    url,
    body,
    failOnStatusCode: false,
    headers: { 'Content-Type': 'application/json' }
  })
})

declare global {
  namespace Cypress {
    interface Chainable {
      api(method: string, url: string, body?: any): Chainable<Cypress.Response<any>>
    }
  }
}
export {}
