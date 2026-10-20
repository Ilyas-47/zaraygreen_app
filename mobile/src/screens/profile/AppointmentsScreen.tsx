import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Calendar, MapPin } from '@expo/vector-icons';
import { appointmentsApi } from '../../api/appointments.api';

export default function AppointmentsScreen({ navigation }: any) {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentsApi.getMy();
      const data = (res.data as any).data || res.data;
      if (Array.isArray(data)) {
        setAppointments(data);
      }
    } catch (err) {
      console.log('Erreur fetch appointments', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabelAndColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'REQUESTED': return { label: 'En attente', colors: 'text-[#F59E0B] bg-yellow-50' };
      case 'CONFIRMED': return { label: 'Confirmée', colors: 'text-[#3B82F6] bg-blue-50' };
      case 'COMPLETED': return { label: 'Terminée', colors: 'text-[#22C55E] bg-green-50' };
      case 'CANCELLED': return { label: 'Annulée', colors: 'text-[#EF4444] bg-red-50' };
      default: return { label: status || 'Inconnu', colors: 'text-gray-500 bg-gray-100' };
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Mes Réservations</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {loading ? (
          <ActivityIndicator size="large" color="#1B4332" style={{ marginTop: 40 }} />
        ) : appointments.length === 0 ? (
          <View className="items-center justify-center mt-20">
            <Ionicons name="calendar-outline" size={64} color="#D1D5DB" />
            <Text className="text-gray-500 text-base mt-4">Aucune réservation pour le moment</Text>
          </View>
        ) : (
          appointments.map((appt) => {
            const { label, colors } = getStatusLabelAndColor(appt.status);
            const dateStr = appt.scheduledAt ? new Date(appt.scheduledAt).toLocaleDateString() : 'Non planifié';
            
            return (
              <View key={appt.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
                <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-4">
                  <View>
                    <Text className="font-bold text-gray-900 text-lg">#{appt.id.slice(0, 8).toUpperCase()}</Text>
                    <Text className="text-gray-500 text-xs mt-1">Date de demande : {new Date(appt.createdAt).toLocaleDateString()}</Text>
                  </View>
                  <View className={`px-3 py-1 rounded-full ${colors.split(' ')[1]}`}>
                    <Text className={`text-xs font-bold ${colors.split(' ')[0]}`}>{label}</Text>
                  </View>
                </View>

                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 rounded-xl bg-[#F4F6F4] items-center justify-center mr-3">
                    <Ionicons name="build-outline" size={20} color="#1B4332" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-900" numberOfLines={1}>
                      {appt.service?.name || 'Service supprimé'}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1" numberOfLines={2}>
                      {appt.service?.description}
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 p-3 rounded-xl gap-2">
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="calendar" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-700">Souhaitée le : <Text className="font-semibold">{dateStr}</Text></Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <Ionicons name="location" size={14} color="#6B7280" />
                    <Text className="text-xs text-gray-700" numberOfLines={1}>{appt.address || 'Aucune adresse'}</Text>
                  </View>
                </View>

                {appt.notes && (
                  <View className="mt-3">
                    <Text className="text-xs text-gray-500 italic">Notes : {appt.notes}</Text>
                  </View>
                )}

              </View>
            );
          })
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
