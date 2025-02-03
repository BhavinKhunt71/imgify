import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import Purchases from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  CREDITS: '@credits',
  LAST_RESET: '@lastReset',
};

const usePremiumHandler = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [credits, setCredits] = useState(0);

  const loadStoredCredits = async () => {
    try {
      const storedCredits = await AsyncStorage.getItem(STORAGE_KEYS.CREDITS);
      const lastReset = await AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET);
      const today = new Date().toDateString();
      
      if (lastReset !== today) {
        const validSubscriptions = await checkSubscriptionStatus();
        if (validSubscriptions > 0) {
          await resetDailyCredits(validSubscriptions);
        }
      } else if (storedCredits) {
        setCredits(parseInt(storedCredits));
      }
    } catch (error) {
      console.error('Error loading stored credits:', error);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      const activeSubscriptions = customerInfo?.activeSubscriptions || [];
      console.log(customerInfo);
      if (activeSubscriptions.length === 0) {
        setIsPremium(false);
        setCredits(0);
        return 0;
      }

      setIsPremium(activeSubscriptions.length > 0);
      
      if (activeSubscriptions.length === 0) {
        setCredits(0);
      }
      
      return activeSubscriptions.length;
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return 0;
    }
  };

  const resetDailyCredits = async (validSubscriptionCount) => {
    try {
      const dailyCredits = validSubscriptionCount > 1 ? 60 : 30;
      const today = new Date().toDateString();
      
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.CREDITS, dailyCredits.toString()],
        [STORAGE_KEYS.LAST_RESET, today]
      ]);
      
      setCredits(dailyCredits);
    } catch (error) {
      console.error('Error resetting daily credits:', error);
    }
  };

  const deductCredits = async (numImages) => {
    if (credits >= numImages) {
      const newCredits = credits - numImages;
      try {
        await AsyncStorage.setItem(STORAGE_KEYS.CREDITS, newCredits.toString());
        setCredits(newCredits);
        return true;
      } catch (error) {
        console.error('Error saving credits:', error);
        return false;
      }
    }
    return false;
  };

  useEffect(() => {
    loadStoredCredits();
    
    const purchaseListener = Purchases.addCustomerInfoUpdateListener(async () => {
      const validSubscriptions = await checkSubscriptionStatus();
      if (validSubscriptions > 0) {
        await resetDailyCredits(validSubscriptions);
      }
    });
    
    return () => purchaseListener?.remove();
  }, []);

  const canGenerateImages = (numImages) => {
    if (!isPremium) return false;
    if (credits < numImages) {
      Alert.alert(
        'Insufficient Credits',
        `You need ${numImages} credits to generate these images. You currently have ${credits} credits. Credits reset daily.`
      );
      return false;
    }
    return true;
  };

  return {
    isPremium,
    credits,
    canGenerateImages,
    deductCredits,
    checkSubscriptionStatus
  };
};

export default usePremiumHandler;