// import prisma from "@/lib/prisma";

// type RateLimitOptions = {
//   key: string;
//   limit: number;
//   windowMs: number;
// };

// export async function rateLimit({ key, limit, windowMs }: RateLimitOptions) {
//   const now = new Date();

//   const record = await prisma.rateLimit.findUnique({
//     where: { key },
//   });

//   // First request or expired window
//   if (!record || record.resetAt < now) {
//     await prisma.rateLimit.upsert({
//       where: { key },
//       update: {
//         count: 1,
//         resetAt: new Date(now.getTime() + windowMs),
//       },
//       create: {
//         key,
//         count: 1,
//         resetAt: new Date(now.getTime() + windowMs),
//       },
//     });

//     return;
//   }

//   // Over limit
//   if (record.count >= limit) {
//     throw new Error("Too many requests. Please try again later.");
//   }

//   // Increment
//   await prisma.rateLimit.update({
//     where: { key },
//     data: { count: { increment: 1 } },
//   });
// }
