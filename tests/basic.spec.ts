import { expect, type Page, test } from '@playwright/test'

// https://tanstack.com/table/latest/docs/guide/sorting#sorting-direction
const expectSorting = async (
  page: Page,
  name: string,
  dataType: 'string' | 'number',
) => {
  const [initialDirection, secondDirection] =
    dataType === 'string'
      ? ['ascending', 'descending']
      : ['descending', 'ascending']
  await expect(page.getByRole('cell', { name })).toHaveAttribute(
    'aria-sort',
    'none',
  )
  await page.getByRole('button', { name }).click()
  await expect(page.getByRole('cell', { name })).toHaveAttribute(
    'aria-sort',
    initialDirection,
  )

  await page.getByRole('button', { name }).click()
  await expect(page.getByRole('cell', { name })).toHaveAttribute(
    'aria-sort',
    secondDirection,
  )

  await page.getByRole('button', { name }).click()
  await expect(page.getByRole('cell', { name })).toHaveAttribute(
    'aria-sort',
    'none',
  )
}

test('sorting', async ({ page }) => {
  await page.goto('/')

  await expectSorting(page, 'Name', 'string')
  await expectSorting(page, 'Size(SI)', 'number')
  await expectSorting(page, 'Modified', 'number')
})

test('files', async ({ page }) => {
  await page.goto('/')

  // data setup creates 20 files
  await expect(page.getByTestId('file-link').all()).resolves.toHaveLength(20)
  await expect(page.getByTestId('file-link').first()).toHaveAttribute(
    'download',
  )
})

test('folder', async ({ page }) => {
  await page.goto('/')

  const firstFolder = page.getByTestId('folder-link').first()

  const folderName = await firstFolder.textContent()

  expect(folderName).not.toBeNull()
  await firstFolder.click()

  await expect(
    page.getByRole('navigation').getByRole('link', { name: folderName! }),
  ).toBeVisible()

  // data setup creates 20 files
  await expect(page.getByTestId('file-link').first()).toHaveAttribute(
    'download',
  )

  await page.getByRole('navigation').getByRole('link').first().click()

  await expect(
    page.getByRole('table').getByRole('link', { name: folderName! }),
  ).toBeVisible()
})

test('404', async ({ page }) => {
  await page.goto('/42')

  await expect(page.getByRole('heading')).toHaveText('poi?')

  await expect(page.getByRole('link')).toBeVisible()

  await page.getByRole('link').click()

  await page.waitForURL('/')
})
