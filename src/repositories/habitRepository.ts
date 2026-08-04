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
        createdAt: record.createdAt.toISOString().split('T')[0],
        archived: record.archived,
        color: record.color ?? undefined,
        completions: completionsObj,
      };
    });
  },

  async createHabit(userId: string, habitData: any) {
    const { id, title, description, categoryId, frequency, targetDays, targetValue, unit, createdAt, archived, color } = habitData;
    
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
        createdAt: createdAt ? new Date(createdAt) : undefined,
        archived: archived || false,
        color,
      },
    });
  },

  async updateHabit(userId: string, id: string, habitData: any) {
    const { title, description, categoryId, frequency, targetDays, targetValue, unit, archived, color } = habitData;
    
    return await prisma.habit.update({
      where: { id, userId },
      data: {
        title,
        description,
        categoryId,
        frequency,
        targetDays: targetDays,
        targetValue,
        unit,
        archived,
        color,
      },
    });
  },

  async deleteHabit(userId: string, id: string) {
    return await prisma.habit.delete({
      where: { id, userId },
    });
  },

  async toggleCompletion(userId: string, habitId: string, dateStr: string, completionData: HabitCompletion) {
    // Verify ownership
    const habit = await prisma.habit.findUnique({
      where: { id: habitId, userId },
    });
    if (!habit) throw new Error("Habit not found or access denied");

    const { completed, value, timestamp, notes } = completionData;
    
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
        timestamp: new Date(timestamp),
        notes,
      },
      create: {
        habitId,
        dateStr,
        completed,
        value,
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
