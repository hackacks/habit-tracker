import prisma from '../lib/prisma';
import { Habit, HabitCompletion } from '../types';

export const habitRepository = {
  async getAllHabits(userId: string): Promise<Habit[]> {
    const records = await prisma.habit.findMany({
      where: { userId },
      include: {
        completions: true,
      },
    });

    return records.map((record) => {
      const completionsObj: Record<string, HabitCompletion> = {};
      record.completions.forEach((c) => {
        completionsObj[c.dateStr] = {
          completed: c.completed,
          value: c.value ?? undefined,
          checklistState: c.checklistState ? (c.checklistState as Record<string, boolean>) : undefined,
          timestamp: c.timestamp.toISOString(),
          notes: c.notes ?? undefined,
        };
      });

      return {
        id: record.id,
        title: record.title,
        description: record.description ?? undefined,
        categoryId: record.categoryId as any,
        frequency: record.frequency as any,
        targetDays: Array.isArray(record.targetDays) ? record.targetDays : [],
        targetValue: record.targetValue ?? undefined,
        unit: record.unit ?? undefined,
        evaluationType: record.evaluationType as any,
        checklistItems: Array.isArray(record.checklistItems) ? (record.checklistItems as string[]) : undefined,
        startDate: record.startDate ?? undefined,
        endDate: record.endDate ?? undefined,
        interval: record.interval ?? undefined,
        targetPerPeriod: record.targetPerPeriod ?? undefined,
        periodType: record.periodType as any ?? undefined,
        priority: record.priority as any ?? 'DEFAULT',
        weeklyTarget: record.weeklyTarget ?? undefined,
        monthlyTarget: record.monthlyTarget ?? undefined,
        createdAt: record.createdAt.toISOString().split('T')[0],
        archived: record.archived,
        color: record.color ?? undefined,
        completions: completionsObj,
      };
    });
  },

  async createHabit(userId: string, habitData: any) {
    const { id, title, description, categoryId, frequency, targetDays, targetValue, unit, evaluationType, checklistItems, startDate, endDate, interval, targetPerPeriod, periodType, priority, weeklyTarget, monthlyTarget, createdAt, archived, color } = habitData;
    
    return await prisma.habit.create({
      data: {
        id,
        userId,
        title,
        description,
        categoryId,
        frequency,
        targetDays: targetDays || [],
        targetValue,
        unit,
        evaluationType,
        checklistItems,
        startDate,
        endDate,
        interval,
        targetPerPeriod,
        periodType,
        priority: priority || 'DEFAULT',
        weeklyTarget,
        monthlyTarget,
        createdAt: createdAt ? new Date(createdAt) : undefined,
        archived: archived || false,
        color,
      },
    });
  },

  async updateHabit(userId: string, id: string, habitData: any) {
    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new Error("Habit not found or access denied");

    const { title, description, categoryId, frequency, targetDays, targetValue, unit, evaluationType, checklistItems, startDate, endDate, interval, targetPerPeriod, periodType, priority, weeklyTarget, monthlyTarget, archived, color } = habitData;
    
    return await prisma.habit.update({
      where: { id },
      data: {
        title,
        description,
        categoryId,
        frequency,
        targetDays: targetDays,
        targetValue,
        unit,
        evaluationType,
        checklistItems,
        startDate,
        endDate,
        interval,
        targetPerPeriod,
        periodType,
        priority,
        weeklyTarget,
        monthlyTarget,
        archived,
        color,
      },
    });
  },

  async deleteHabit(userId: string, id: string) {
    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });
    if (!existing) throw new Error("Habit not found or access denied");

    return await prisma.habit.delete({
      where: { id },
    });
  },

  async toggleCompletion(userId: string, habitId: string, dateStr: string, completionData: HabitCompletion) {
    // Verify ownership
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });
    if (!habit) throw new Error("Habit not found or access denied");

    const { completed, value, checklistState, timestamp, notes } = completionData;
    
    return await prisma.habitCompletion.upsert({
      where: {
        habitId_dateStr: {
          habitId,
          dateStr,
        },
      },
      update: {
        completed,
        value,
        checklistState,
        timestamp: new Date(timestamp),
        notes,
      },
      create: {
        habitId,
        dateStr,
        completed,
        value,
        checklistState,
        timestamp: new Date(timestamp),
        notes,
      },
    });
  },
  
  async batchCreateHabits(userId: string, habits: any[]) {
    // Used for importing / seeding
    for (const habit of habits) {
      await this.createHabit(userId, habit);
      if (habit.completions) {
        for (const dateStr of Object.keys(habit.completions)) {
          await this.toggleCompletion(userId, habit.id, dateStr, habit.completions[dateStr]);
        }
      }
    }
  },
  
  async clearAll(userId: string) {
    await prisma.habit.deleteMany({
      where: { userId },
    });
  }
};
