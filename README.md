# Fe-ed



https://github.com/468/fe-ed/assets/8698057/f371344b-1b68-4cb2-922f-1851823cf7f4



Fe-ed is an experimental tool which uses ChatGPT-3.5 to formulate unexpected connections between bookmarked web pages by analysing their contents. It consists of two parts: a bookmarking tool, which sends saved pages to Fe-ed, and a microsite for viewing your connected bookmarks in an explorable 3D graph. Fe-ed will also intermediately suggest new sites that might interest you, and adds them to the graph (indicated by lighter grey nodes).

![screenshot2](https://github.com/468/fe-ed/assets/8698057/adeaa5f2-6c2f-4ff9-b5f3-b943f09a8e55)

Screenshot from Chrome add-on. Clicking 'digest' adds the website being viewed to the Fe-ed graph for processing.

Fe-ed is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
