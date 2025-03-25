'use server';

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export const signUp = async (params: SignUpParams) => {
   const {uid, email, name} = params;

   try {
    const userRecord = await db.collection('users').doc(uid).get();
    if(userRecord.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in instead."
      }
    }
    await db.collection('users').doc(uid).set({
        email,
        name
        });
        return {
            success: true,
            message: "Account created successfully. Please sign in."
        }

   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   } catch (error: any) {
     console.error("Error creating a user", error);
     if(error.code === 'auth/email-already-in-use') {
       return {
        success: false,
        message: "This email is already in use."
       }
     }
     return {
        success: false,
        message: "Failed to create an account"
     }
   }
};

export const signIn = async (params: SignInParams) => {
    const {email, idToken} = params;
    try {
        const userRecord = await auth.getUserByEmail(email);
        if(!userRecord) {
            return {
                success: false,
                message: "User does not exist. Create an account instead."
            }
        }
       await setSeessionCookie(idToken);
    } catch (error) {
        console.error("Error signing in", error);
        return {
            success: false,
            message: "Failed to log into an  account"
        }
    }
}


export const setSeessionCookie = async (idToken: string) => {
    const cookieStore = await cookies();
    const sessionCookie = await auth.createSessionCookie(idToken, {expiresIn: ONE_WEEK * 1000});
    cookieStore.set('session', sessionCookie, {
        maxAge: ONE_WEEK,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/'
    })
}

export const getCurrentUser = async (): Promise<User | null> => {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();
    if (!userRecord.exists) {
      return null;
    }
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    console.error("Error verifying session cookie", error);
    return null;
  }
};

export const isAuthenticated = async () => {
  const user = await getCurrentUser();
  return !!user;
};

export const getInterviewsByUserId = async (userId: string) => {
  const interviews = await db
    .collection("interviews")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .get();
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
};

export const getLatestInteviews = async (params: GetLatestInterviewsParams) => {
  const { userId, limit = 20 } = params;
  if (!userId) {
    console.error("Error: userId is undefined");
    return []; // Return an empty array if userId is undefined
  }
  const interviews = await db
    .collection("interviews")
    .orderBy("createdAt", "desc")
    .where("finalized", "==", true)
    .where("userId", "!=", userId)
    .limit(limit)
    .get();
  return interviews.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Interview[];
};
 