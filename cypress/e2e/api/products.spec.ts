// cypress/e2e/api/products.spec.ts
// API tests for DummyJSON Products: https://dummyjson.com/docs/products
// Run: npx cypress run --spec cypress/e2e/api/products.spec.ts

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
  it('GET /products returns 30 items by default', () => {
    cy.api('GET', '/products').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse
      expect(Array.isArray(data.products)).to.be.true
      expect(data.products.length).to.eq(30)
      expect(data).to.have.keys(['products', 'total', 'skip', 'limit'])
    })
  })

  it('GET /products honors limit & skip and supports select fields', () => {
    cy.api('GET', '/products?limit=10&skip=10&select=title,price').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse
      expect(data.limit).to.eq(10)
      expect(data.skip).to.eq(10)
      expect(data.products.length).to.eq(10)
      // Ensure only selected fields appear (allow id but title/price must exist)
      data.products.forEach(p => {
        expect(p).to.have.property('title')
        expect(p).to.have.property('price')
        // It should not include description when select is used
        expect(p).to.not.have.property('description')
      })
    })
  })

  it('GET /products supports sorting by title asc', () => {
    cy.api('GET', '/products?sortBy=title&order=asc&limit=10').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse
      const titles = data.products.map(p => p.title.toLowerCase())
      const sorted = [...titles].sort((a, b) => a.localeCompare(b))
      expect(titles).to.deep.eq(sorted)

    })
  })

  it('GET /products/:id returns a single product', () => {
    cy.api('GET', '/products/1').then((res) => {
      expect(res.status).to.eq(200)
      const product = res.body as Product
      expect(product.id).to.eq(1)
      expect(product).to.have.property('title')
      expect(product).to.have.property('price')
    })
  })

  it('GET /products/search?q=phone returns matching products', () => {
    cy.api('GET', '/products/search?q=phone').then((res) => {
      expect(res.status).to.eq(200)
      const data = res.body as ProductsResponse
      expect(data.products.length).to.be.greaterThan(0)
      const hasMatch = data.products.some(p => p.title.toLowerCase().includes('phone'))
      expect(hasMatch).to.be.true
    })
  })

  it('GET categories endpoints return arrays and valid category fetch works', () => {
    cy.api('GET', '/products/categories').then((res) => {
      expect(res.status).to.eq(200)
      const categories = res.body as string[]
      expect(Array.isArray(categories)).to.be.true
      expect(categories).to.be.an('array').that.is.not.empty

    const category = categories.includes('smartphones')
    ? 'smartphones'
    : categories[0]

    cy.api('GET', `/products/category/${category}`).then((res2) => {

        expect(res2.status).to.eq(200)
        const data = res2.body as ProductsResponse
        expect(data.products.length).to.be.greaterThan(0)
        data.products.forEach(p => expect(p.category).to.eq(category))
      })
    })

    cy.api('GET', '/products/category-list').then((res) => {
      expect(res.status).to.eq(200)
      const list = res.body as { slug: string, name: string, url: string }[]
      expect(Array.isArray(list)).to.be.true
      expect(list.length).to.be.greaterThan(0)
    })
  })

  it('POST /products/add simulates creation and returns new id', () => {
    cy.api('POST', '/products/add', { title: 'BMW Pencil', price: 5 }).then((res) => {
      expect(res.status).to.eq(200) // dummyjson returns 200 for simulated POST
      const product = res.body as Product & { id: number }
      expect(product.title).to.eq('BMW Pencil')
      expect(product).to.have.property('id')
    })
  })

  it('PUT /products/:id simulates update', () => {
    cy.api('PUT', '/products/1', { title: 'iPhone Galaxy +1' }).then((res) => {
      expect([200, 201]).to.include(res.status)
      const product = res.body as Product
      expect(product.title).to.eq('iPhone Galaxy +1')
    })
  })

  it('PATCH /products/:id simulates partial update', () => {
    cy.api('PATCH', '/products/1', { price: 999 }).then((res) => {
      expect(res.status).to.eq(200)
      const product = res.body as Product
      expect(product.price).to.eq(999)
    })
  })

  it('DELETE /products/:id simulates deletion and returns isDeleted', () => {
    cy.api('DELETE', '/products/1').then((res) => {
      expect(res.status).to.eq(200)
      expect(res.body).to.have.property('isDeleted', true)
      expect(res.body).to.have.property('deletedOn')
    })
  })

  it('Negative: GET non-existing product returns 404', () => {
    cy.api('GET', '/products/999999').then((res) => {
      expect([404, 200]).to.include(res.status) // some mirrors may return 200 with not found
      if (res.status === 404) {
        expect(res.body).to.have.property('message')
      } else {
        // if it returns 200, ensure body is not a valid product object with required fields
        expect(res.body).to.not.have.property('id', 999999)
      }
    })
  })
})
