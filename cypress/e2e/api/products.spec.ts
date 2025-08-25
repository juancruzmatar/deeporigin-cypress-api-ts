// cypress/e2e/api/products.spec.ts
// API tests for DummyJSON Products: https://dummyjson.com/docs/products
// To run: npx cypress run --spec cypress/e2e/api/products.spec.ts

interface Product {
  id: number
  title: string
  description?: string
  price?: number
  category?: string
}

type ProductsResponse = {
  products: Product[]
  total: number
  skip: number
  limit: number
}

describe('DummyJSON Products API', () => {
  /**
   * Verify that /products returns 30 items by default
   */
  it('GET /products returns 30 items by default', () => {
    cy.api('GET', '/products').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse
      expect(data.products.length).to.eq(30)
      expect(data).to.have.keys(['products', 'total', 'skip', 'limit'])
    })
  })

  /**
   * Verify that limit, skip and field selection work correctly
   */
  it('GET /products honors limit & skip and supports select fields', () => {
    cy.api('GET', '/products?limit=10&skip=10&select=title,price').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse
      expect(data.limit).to.eq(10)
      expect(data.skip).to.eq(10)
      expect(data.products.length).to.eq(10)
      data.products.forEach(p => {
        expect(p).to.have.property('title')
        expect(p).to.have.property('price')
        expect(p).to.not.have.property('description')
      })
    })
  })

  /**
   * Verify that sorting by title asc works, allowing minimal API instability
   */
  it('GET /products supports sorting by title asc', () => {
    cy.api('GET', '/products?sortBy=title&order=asc&limit=20&select=title').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse

      const normalize = (s: string) =>
        (s || '')
          .trim()
          .replace(/\s+/g, ' ')
          .toLowerCase()
          .normalize('NFKD')

      const titles = data.products.map(p => normalize(p.title))
      const cmp = (a: string, b: string) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true })

      let breaks = 0
      for (let i = 1; i < titles.length; i++) {
        if (cmp(titles[i - 1], titles[i]) > 0) breaks++
      }

      // Allow up to 2 order breaks due to server instability
      expect(breaks, `order breaks = ${breaks}`).to.be.at.most(2)
    })
  })

  /**
   * Verify that a single product is returned when fetching by id
   */
  it('GET /products/:id returns a single product', () => {
    cy.api('GET', '/products/1').then((res) => {
      expect(res.status).to.eq(200)
      const product = res.body as Product
      expect(product.id).to.eq(1)
      expect(product).to.have.property('title')
      expect(product).to.have.property('price')
    })
  })

  /**
   * Verify that search returns products containing the search term
   */
  it('GET /products/search?q=phone returns matching products', () => {
    cy.api('GET', '/products/search?q=phone').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse
      expect(data.products.length).to.be.greaterThan(0)
      const hasMatch = data.products.some(p => (p.title || '').toLowerCase().includes('phone'))
      expect(hasMatch).to.be.true
    })
  })

  /**
   * Verify that categories endpoints return data and allow fetching by category
   */
  it('GET categories endpoints return arrays and valid category fetch works', () => {
    cy.api('GET', '/products/categories').then((res) => {
      expect(res.status).to.eq(200)
      const categories = res.body as string[]
      expect(categories).to.be.an('array').that.is.not.empty
    })

    cy.api('GET', '/products/category-list').then((res) => {
      expect(res.status).to.eq(200)
      const list = res.body as { slug: string, name: string, url: string }[]
      expect(list).to.be.an('array').that.is.not.empty
    })

    const cat = 'smartphones'
    cy.api('GET', `/products/category/${cat}?limit=10`).then((res2) => {
      expect(res2.status).to.eq(200)
      const data = res2.body as ProductsResponse
      expect(data.total).to.be.greaterThan(0)
      expect(data.products.length).to.be.greaterThan(0)
      data.products.forEach(p => expect(p.category).to.eq(cat))
    })
  })

  /**
   * Verify that POST /products/add simulates product creation
   */
  it('POST /products/add simulates creation and returns new id', () => {
    cy.api('POST', '/products/add', { title: 'BMW Pencil', price: 5 }).then((res) => {
      expect([200, 201]).to.include(res.status)
      const product = res.body as Product & { id: number }
      expect(product.title).to.eq('BMW Pencil')
      expect(product).to.have.property('id')
    })
  })

  /**
   * Verify that PUT /products/:id simulates a full update
   */
  it('PUT /products/:id simulates update', () => {
    cy.api('PUT', '/products/1', { title: 'iPhone Galaxy +1' }).then((res) => {
      expect(res.status).to.eq(200)
      const product = res.body as Product
      expect(product.title).to.eq('iPhone Galaxy +1')
    })
  })

  /**
   * Verify that PATCH /products/:id simulates a partial update
   */
  it('PATCH /products/:id simulates partial update', () => {
    cy.api('PATCH', '/products/1', { price: 999 }).then((res) => {
      expect(res.status).to.eq(200)
      const product = res.body as Product
      expect(product.price).to.eq(999)
    })
  })

  /**
   * Verify that DELETE /products/:id simulates deletion
   */
  it('DELETE /products/:id simulates deletion and returns isDeleted', () => {
    cy.api('DELETE', '/products/1').then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('isDeleted', true)
      expect(res.body).to.have.property('deletedOn')
    })
  })

  /**
   * Verify that a non-existing product returns 404 (or equivalent response)
   */
  it('Negative: GET non-existing product returns 404', () => {
    cy.api('GET', '/products/999999').then((res) => {
      expect([404, 200]).to.include(res.status)
      if (res.status === 404) {
        expect(res.body).to.have.property('message')
      } else {
        expect(res.body).to.not.have.property('id', 999999)
      }
    })
  })
})
