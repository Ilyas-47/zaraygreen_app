import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ordersApi } from '../../api/orders.api';

export default function OrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      ordersApi.getMyOrders()
        .then(res => {
          const data = (res.data as any).data || res.data;
          if (Array.isArray(data)) {
            setOrders(data);
          }
        })
        .catch(err => console.log('Erreur fetch my orders:', err))
        .finally(() => setLoading(false));
    }, [])
  );

  const getStatusColor = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'delivered': return 'text-[#22C55E] bg-green-50';
      case 'processing':
      case 'en_cours': return 'text-[#F59E0B] bg-yellow-50';
      case 'confirmed': return 'text-blue-500 bg-blue-50';
      case 'annule': return 'text-red-500 bg-red-50';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  const formatStatus = (status: string) => {
    switch(status?.toLowerCase()) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'en_cours': return 'En cours';
      case 'delivered': return 'Livrée';
      case 'annule': return 'Annulée';
      default: return status || 'Inconnu';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#F9FAFB]">
      <View className="flex-row items-center px-6 py-4 bg-white border-b border-gray-100">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Historique des Commandes</Text>
      </View>

      <ScrollView className="flex-1 px-6 pt-6">
        {loading ? (
          <ActivityIndicator size="large" color="#14532D" style={{ marginTop: 40 }} />
        ) : orders.length === 0 ? (
          <View className="items-center mt-10">
            <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
            <Text className="text-center text-gray-500 mt-4 text-base">Vous n'avez pas encore passé de commande.</Text>
          </View>
        ) : (
          orders.map((order) => (
            <View key={order.id} className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-gray-100">
              <View className="flex-row justify-between items-center mb-4 border-b border-gray-100 pb-4">
                <View>
                  <Text className="font-bold text-gray-900 text-lg">CMD-{order.id.slice(0, 8).toUpperCase()}</Text>
                  <Text className="text-gray-500 text-xs mt-1">{new Date(order.createdAt).toLocaleDateString()}</Text>
                </View>
                <View className={`px-3 py-1 rounded-full ${getStatusColor(order.status).split(' ')[1]}`}>
                  <Text className={`text-xs font-bold ${getStatusColor(order.status).split(' ')[0]}`}>
                    {formatStatus(order.status)}
                  </Text>
                </View>
              </View>

              {order.items?.map((item: any, index: number) => {
                let imageUrl = 'https://via.placeholder.com/150';
                try {
                  const images = item.product?.images ? JSON.parse(item.product.images) : [];
                  if (images.length > 0) imageUrl = images[0];
                } catch (e) {}

                return (
                  <View key={index} className="flex-row items-center mb-3">
                    <Image source={{ uri: imageUrl }} className="w-12 h-12 rounded-xl bg-gray-100 mr-3" />
                    <View className="flex-1">
                      <Text className="text-sm font-medium text-gray-900" numberOfLines={1}>
                        {item.product?.name || 'Produit inconnu'}
                      </Text>
                      <Text className="text-xs text-gray-500">Qté: {item.quantity}</Text>
                    </View>
                    <Text className="text-sm font-bold text-gray-900">{item.price} MAD</Text>
                  </View>
                );
              })}

              <View className="flex-row justify-between items-center mt-2 pt-4 border-t border-gray-100">
                <Text className="text-gray-500 font-medium">Total de la commande</Text>
                <Text className="font-bold text-lg text-[#14532D]">{order.totalAmount} MAD</Text>
              </View>
            </View>
          ))
        )}
        <View className="h-10" />
      </ScrollView>
    </SafeAreaView>
  );
}
